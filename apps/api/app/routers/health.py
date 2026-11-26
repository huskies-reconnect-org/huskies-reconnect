import asyncio
import os

import httpx

from fastapi import APIRouter, Response, status
from starlette.concurrency import run_in_threadpool

from app import db
from app.config import get_settings
from app.deps import get_jwks_client

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Liveness: the process is up. Render's health check uses this, so it never
    depends on the database or Supabase."""
    return {"status": "ok"}


async def _check_database() -> str:
    if db.pool is None:
        return "not_configured"
    try:
        async with asyncio.timeout(5):
            async with db.pool.connection() as conn:
                await conn.execute("select 1")
        return "ok"
    except Exception:
        return "error"


async def _check_auth_keys() -> str:
    if not get_settings().supabase_url:
        return "not_configured"
    try:
        keys = await asyncio.wait_for(run_in_threadpool(lambda: get_jwks_client().get_jwk_set()), 5)
        return "ok" if keys.keys else "error"
    except Exception:
        return "error"


async def _check_gemini() -> str:
    """Validates the key by listing one model: no generation, no quota spent on content."""
    key = get_settings().gemini_api_key
    if not key:
        return "not_configured"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get("https://generativelanguage.googleapis.com/v1beta/models",
                                 params={"pageSize": 1}, headers={"x-goog-api-key": key})
        return "ok" if r.status_code == 200 else "error"
    except httpx.HTTPError:
        return "error"


@router.get("/health/ready")
async def ready(response: Response) -> dict:
    """Readiness: can the API reach Postgres, Supabase's signing keys and Gemini?
    Reports only ok / error / not_configured, never config values."""
    database, auth_keys, gemini = await asyncio.gather(
        _check_database(), _check_auth_keys(), _check_gemini())
    checks = {"database": database, "auth_keys": auth_keys, "gemini": gemini}
    ok = all(v == "ok" for v in checks.values())
    if not ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    # Render sets RENDER_GIT_COMMIT, so we can tell which code is actually deployed.
    version = (os.environ.get("RENDER_GIT_COMMIT") or "local")[:7]
    return {"status": "ok" if ok else "degraded", "checks": checks, "version": version}
