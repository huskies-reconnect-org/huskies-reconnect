from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from psycopg import AsyncConnection
from psycopg.rows import class_row
from pydantic import BaseModel

from app.config import get_settings
from app.db import get_conn
from app.deps import get_current_user_id

router = APIRouter(prefix="/courses", tags=["matches"])


class Match(BaseModel):
    user_id: UUID
    full_name: str | None
    major: str | None
    grad_year: int | None
    interests: str | None
    goals: str | None
    similarity: float


# Operator is schema-qualified so this works whatever the search_path is.
_MATCHES_SQL = """
    with me as (select embedding from public.users where id = %(me)s)
    select u.id as user_id, u.full_name, u.major, u.grad_year, u.interests, u.goals,
           1 - (u.embedding OPERATOR(extensions.<=>) me.embedding) as similarity
      from public.course_members m
      join public.users u on u.id = m.user_id
      cross join me
     where m.course_id = %(course)s
       and m.status = 'active'
       and u.id <> %(me)s
       and u.embedding is not null
       and 1 - (u.embedding OPERATOR(extensions.<=>) me.embedding) >= %(min_similarity)s
     order by u.embedding OPERATOR(extensions.<=>) me.embedding, u.id
     limit %(limit)s
"""


@router.get("/{course_id}/matches", response_model=list[Match])
async def course_matches(
    course_id: UUID,
    limit: int = Query(default=5, ge=1, le=20),
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> list[Match]:
    """Classmates in this course ranked by profile similarity, above the relevance bar."""
    row = await (await conn.execute(
        """select exists (select 1 from public.courses where id = %(course)s),
                  exists (select 1 from public.course_members
                           where course_id = %(course)s and user_id = %(me)s and status = 'active'),
                  (select embedding is not null from public.users where id = %(me)s)""",
        {"course": course_id, "me": user_id},
    )).fetchone()
    course_exists, is_member, has_embedding = row

    if not course_exists:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
    if not is_member:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Join this course to see classmates")
    if not has_embedding:
        raise HTTPException(status.HTTP_409_CONFLICT, "Complete your profile to see matches")

    async with conn.cursor(row_factory=class_row(Match)) as cur:
        await cur.execute(_MATCHES_SQL, {
            "me": user_id,
            "course": course_id,
            "min_similarity": get_settings().match_min_similarity,
            "limit": limit,
        })
        return await cur.fetchall()
