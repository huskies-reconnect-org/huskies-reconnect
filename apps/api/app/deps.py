from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

_bearer = HTTPBearer(auto_error=False)


@lru_cache
def get_jwks_client() -> jwt.PyJWKClient:
    """Fetches and caches the project's public signing keys (ES256)."""
    base = get_settings().supabase_url.rstrip("/")
    return jwt.PyJWKClient(f"{base}/auth/v1/.well-known/jwks.json", cache_keys=True, lifespan=600)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user_id(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Verify the Supabase access token and return the user id (`sub`).

    Sync on purpose: PyJWKClient fetches keys with blocking I/O, so FastAPI runs
    this in its threadpool instead of on the event loop.
    """
    if creds is None:
        raise _unauthorized("Missing bearer token")

    settings = get_settings()
    token = creds.credentials
    try:
        key = get_jwks_client().get_signing_key_from_jwt(token).key
        claims = jwt.decode(
            token,
            key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1",
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except jwt.PyJWTError:
        raise _unauthorized("Invalid or expired token")

    email = str(claims.get("email", "")).lower()
    if not email.endswith(f"@{settings.allowed_email_domain}"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account not allowed")

    return claims["sub"]
