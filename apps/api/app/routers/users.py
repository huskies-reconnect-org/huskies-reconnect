from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import AsyncConnection
from psycopg.rows import class_row
from pydantic import BaseModel

from app.db import get_conn
from app.deps import get_current_user_id

router = APIRouter(tags=["users"])


class Me(BaseModel):
    id: str
    email: str
    full_name: str | None
    major: str | None
    grad_year: int | None


@router.get("/me", response_model=Me)
async def me(
    user_id: str = Depends(get_current_user_id),
    conn: AsyncConnection = Depends(get_conn),
) -> Me:
    async with conn.cursor(row_factory=class_row(Me)) as cur:
        await cur.execute(
            "select id::text, email, full_name, major, grad_year from public.users where id = %s",
            (user_id,),
        )
        row = await cur.fetchone()
    if row is None:
        # Signup trigger should always create the row; this means it didn't.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return row
