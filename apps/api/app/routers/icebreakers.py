import logging
import time
from collections import defaultdict, deque
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection
from psycopg.rows import dict_row
from pydantic import BaseModel

from app.config import get_settings
from app.db import get_conn
from app.deps import get_current_user_id
from app.icebreakers import (GenerationBlocked, GenerationError, GenerationRateLimited, Generator, Person,
                             get_generator)
from app.safety import check_intro

log = logging.getLogger(__name__)
router = APIRouter(prefix="/courses", tags=["icebreakers"])

# Simple per-process limit to protect the Gemini quota (Render runs one instance).
_RATE_LIMIT, _RATE_WINDOW_S = 10, 600
_recent: dict[str, deque[float]] = defaultdict(deque)


def _check_rate_limit(user_id: str) -> None:
    now = time.monotonic()
    q = _recent[user_id]
    while q and now - q[0] > _RATE_WINDOW_S:
        q.popleft()
    if len(q) >= _RATE_LIMIT:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many drafts. Try again in a few minutes.")
    q.append(now)


class Icebreaker(BaseModel):
    status: Literal["ok", "blocked"]
    message: str | None
    model: str


_PAIR_SQL = """
    select c.code || ' ' || c.title as course,
           me.full_name as me_name, me.major as me_major, me.interests as me_interests, me.goals as me_goals,
           me.embedding is not null as me_ready,
           my.status as my_status,
           them.id is not null as them_member,
           them.full_name as them_name, them.major as them_major,
           them.interests as them_interests, them.goals as them_goals,
           case when me.embedding is not null and them.embedding is not null
                     and me.embedding_model = them.embedding_model
                then 1 - (me.embedding OPERATOR(extensions.<=>) them.embedding) end as similarity
      from public.courses c
      join public.users me on me.id = %(me)s
      left join public.course_members my on my.course_id = c.id and my.user_id = me.id
      left join lateral (
            select u.* from public.course_members m join public.users u on u.id = m.user_id
             where m.course_id = c.id and m.user_id = %(them)s and m.status = my.status
               and u.id <> me.id) them on true
     where c.id = %(course)s
"""


@router.post("/{course_id}/matches/{classmate_id}/icebreaker", response_model=Icebreaker)
async def draft_icebreaker(
    course_id: UUID,
    classmate_id: UUID,
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
    generator: Generator = Depends(get_generator),
) -> Icebreaker:
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(_PAIR_SQL, {"me": user_id, "them": classmate_id, "course": course_id})
        row = await cur.fetchone()

    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    if row["my_status"] is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Join this course first")
    if not row["me_ready"]:
        raise HTTPException(status.HTTP_409_CONFLICT, "Complete your profile first")
    if not row["them_member"]:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Classmate not found in this course")
    if row["similarity"] is None or row["similarity"] < get_settings().match_min_similarity:
        # Only pairs that clear the relevance bar get an AI-drafted intro.
        raise HTTPException(status.HTTP_409_CONFLICT, "Not a match")

    _check_rate_limit(user_id)

    sender = Person(row["me_name"] or "A classmate", row["me_major"], row["me_interests"], row["me_goals"])
    classmate = Person(row["them_name"] or "Classmate", row["them_major"], row["them_interests"], row["them_goals"])

    for attempt in range(2):  # one retry if our own check rejects a draft
        try:
            text = await generator.draft(sender, classmate, row["course"],
                                         reconnecting=row["my_status"] == "alumni")
        except GenerationBlocked as e:
            log.info("icebreaker blocked by Gemini filter: %s", e)
            return Icebreaker(status="blocked", message=None, model=generator.model)
        except GenerationRateLimited as e:
            log.warning("icebreaker rate limited by Gemini: retry after %ss", e.retry_after)
            wait = e.retry_after or 60
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS,
                                f"The AI is busy right now. Try again in {wait} seconds.",
                                headers={"Retry-After": str(wait)})
        except GenerationError as e:
            log.warning("icebreaker generation failed: %s", e)
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Couldn't draft an intro right now")

        result = check_intro(text)
        if result.ok:
            return Icebreaker(status="ok", message=text.strip(), model=generator.model)
        log.info("icebreaker draft rejected by safety check (attempt %d): %s", attempt + 1, result.reason)

    return Icebreaker(status="blocked", message=None, model=generator.model)
