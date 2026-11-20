"""Demo admin actions. Only emails in ADMIN_EMAILS may call these."""
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection
from pydantic import BaseModel

from app.config import get_settings
from app.db import get_conn
from app.deps import get_current_user_id

router = APIRouter(prefix="/courses", tags=["admin"])


class SemesterChange(BaseModel):
    action: Literal["end", "reset"]


class SemesterResult(BaseModel):
    course_id: UUID
    status: Literal["active", "alumni"]
    members_updated: int


async def require_admin(
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> str:
    row = await (await conn.execute("select email from public.users where id = %s", (user_id,))).fetchone()
    if row is None or not get_settings().is_admin(row[0]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admins only")
    return user_id


@router.post("/{course_id}/semester", response_model=SemesterResult)
async def change_semester(
    course_id: UUID,
    body: SemesterChange,
    _: str = Depends(require_admin),
    conn: AsyncConnection = Depends(get_conn),
) -> SemesterResult:
    """Simulate the semester ending (everyone becomes alumni) or undo it for another rehearsal."""
    new_status = "alumni" if body.action == "end" else "active"
    async with conn.transaction():
        if not await (await conn.execute("select 1 from public.courses where id = %s", (course_id,))).fetchone():
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found")
        cur = await conn.execute(
            "update public.course_members set status = %s where course_id = %s and status <> %s",
            (new_status, course_id, new_status))
    return SemesterResult(course_id=course_id, status=new_status, members_updated=cur.rowcount)
