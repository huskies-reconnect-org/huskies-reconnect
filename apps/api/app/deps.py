from fastapi import HTTPException, status


async def get_current_user_id() -> str:
    """Resolve the logged-in user from the Supabase JWT.

    Stub until Step 3: will verify the bearer token against Supabase's JWKS
    and return the `sub` claim. Until then every protected route returns 401.
    """
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not configured yet",
        headers={"WWW-Authenticate": "Bearer"},
    )
