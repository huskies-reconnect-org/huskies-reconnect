from collections.abc import AsyncIterator

from fastapi import HTTPException, status
from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from app.config import get_settings

# Created in main.lifespan. Connects as the postgres role, so RLS is bypassed:
# every query here must scope itself to the current user.
pool: AsyncConnectionPool | None = None


def create_pool() -> AsyncConnectionPool | None:
    url = get_settings().database_url
    if not url:
        return None
    # Supabase free tier's session pooler allows few connections; keep this small.
    return AsyncConnectionPool(url, min_size=1, max_size=5, open=False)


async def get_conn() -> AsyncIterator[AsyncConnection]:
    if pool is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Database not configured")
    async with pool.connection() as conn:
        yield conn
