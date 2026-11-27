import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection
from psycopg.rows import dict_row
from pydantic import BaseModel, Field, StringConstraints

from app.config import get_settings
from app.db import get_conn
from app.deps import get_current_user_id
from app.embeddings import (Embedder, EmbeddingError, embedding_tag, get_embedder, profile_text,
                            to_pgvector)

log = logging.getLogger(__name__)
router = APIRouter(tags=["users"])

_ME_SELECT = """
    select id::text, email, full_name, major, grad_year, interests, goals,
           avatar_color, avatar_badge,
           embedding is not null as matchable, embedding_model
      from public.users where id = %s
"""


# Must match the check constraint in migration 20261127010000_users_avatar.sql.
AvatarColor = Literal["blush", "sky", "peach", "mint", "lavender", "butter", "teal", "stone"]


class Me(BaseModel):
    id: str
    email: str
    full_name: str | None
    major: str | None
    grad_year: int | None
    interests: str | None
    goals: str | None
    avatar_color: AvatarColor | None
    avatar_badge: str | None
    profile_complete: bool
    matchable: bool  # has an embedding, so can appear in matches
    is_admin: bool


def _to_me(row: dict) -> Me:
    complete = all(row.get(k) for k in ("full_name", "major", "interests", "goals"))
    return Me(**row, profile_complete=complete, is_admin=get_settings().is_admin(row.get("email")))


async def _load_me(conn: AsyncConnection, user_id: str) -> dict:
    async with conn.cursor(row_factory=dict_row) as cur:
        await cur.execute(_ME_SELECT, (user_id,))
        row = await cur.fetchone()
    if row is None:
        # Signup trigger should always create the row; this means it didn't.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return row


@router.get("/me", response_model=Me)
async def me(
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> Me:
    return _to_me(await _load_me(conn, user_id))


Short = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Long = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class ProfileIn(BaseModel):
    full_name: Short
    major: Short
    grad_year: int | None = Field(default=None, ge=2020, le=2035)
    interests: Long
    goals: Long
    # Optional so older clients keep working; omitted means "no choice" (cleared).
    avatar_color: AvatarColor | None = None
    avatar_badge: Short | None = None


class ProfileOut(Me):
    embedding_status: Literal["updated", "unchanged", "failed"]


@router.put("/me/profile", response_model=ProfileOut)
async def update_profile(
    body: ProfileIn,
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
    embedder: Embedder = Depends(get_embedder),
) -> ProfileOut:
    current = await _load_me(conn, user_id)

    new_text = profile_text(body.interests, body.goals)
    old_text = profile_text(current["interests"], current["goals"])
    tag = embedding_tag(embedder.model)

    embedding: str | None = None
    if new_text == old_text and current["matchable"] and current["embedding_model"] == tag:
        embedding_status = "unchanged"
    else:
        try:
            embedding = to_pgvector(await embedder.embed(new_text))
            embedding_status = "updated"
        except EmbeddingError as e:
            # Save the profile anyway; the old embedding (if any) stays until a later save succeeds.
            log.warning("profile embedding failed for %s: %s", user_id, e)
            embedding_status = "failed"

    await conn.execute(
        """update public.users
              set full_name = %(full_name)s, major = %(major)s, grad_year = %(grad_year)s,
                  interests = %(interests)s, goals = %(goals)s,
                  avatar_color = %(avatar_color)s, avatar_badge = %(avatar_badge)s,
                  embedding       = coalesce(%(embedding)s::extensions.vector, embedding),
                  embedding_model = case when %(embedding)s::text is null then embedding_model else %(model)s end,
                  embedded_at     = case when %(embedding)s::text is null then embedded_at else now() end
            where id = %(id)s""",
        {**body.model_dump(), "embedding": embedding, "model": tag, "id": user_id},
    )
    row = await _load_me(conn, user_id)
    return ProfileOut(**_to_me(row).model_dump(), embedding_status=embedding_status)
