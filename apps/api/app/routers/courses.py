from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection
from psycopg.rows import class_row
from pydantic import BaseModel

from app.db import get_conn
from app.deps import get_current_user_id

router = APIRouter(prefix="/courses", tags=["courses"])


class Course(BaseModel):
    id: UUID
    code: str
    title: str
    term: str
    section: str | None
    ends_on: date
    member_count: int
    joined: bool


# The API connects as postgres (RLS bypassed), so every query scopes to user_id itself.
_COURSE_SELECT = """
    select c.id, c.code, c.title, c.term, c.section, c.ends_on,
           (select count(*) from public.course_members m
             where m.course_id = c.id and m.status = 'active')::int as member_count,
           exists (select 1 from public.course_members m
                    where m.course_id = c.id and m.user_id = %(user_id)s) as joined
      from public.courses c
"""


@router.get("", response_model=list[Course])
async def list_courses(
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> list[Course]:
    async with conn.cursor(row_factory=class_row(Course)) as cur:
        await cur.execute(_COURSE_SELECT + " order by c.term desc, c.code, c.section",
                          {"user_id": user_id})
        return await cur.fetchall()


@router.post("/{course_id}/join", response_model=Course)
async def join_course(
    course_id: UUID,
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> Course:
    """Idempotent: joining a course you're already in returns it unchanged."""
    async with conn.transaction():
        exists = await (await conn.execute(
            "select 1 from public.courses where id = %s", (course_id,))).fetchone()
        if exists is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")

        profile = await (await conn.execute(
            "select 1 from public.users where id = %s", (user_id,))).fetchone()
        if profile is None:
            # Signup trigger should always create this row.
            raise HTTPException(status.HTTP_409_CONFLICT, "Profile not found")

        await conn.execute(
            """insert into public.course_members (user_id, course_id)
               values (%s, %s) on conflict do nothing""",
            (user_id, course_id),
        )

        async with conn.cursor(row_factory=class_row(Course)) as cur:
            await cur.execute(_COURSE_SELECT + " where c.id = %(course_id)s",
                              {"user_id": user_id, "course_id": course_id})
            return await cur.fetchone()
