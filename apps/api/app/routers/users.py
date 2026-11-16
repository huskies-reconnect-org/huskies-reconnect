from fastapi import APIRouter, Depends

from app.deps import get_current_user_id

router = APIRouter(tags=["users"])


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)) -> dict[str, str]:
    # Step 3: look up the row in public.users and return the profile.
    return {"id": user_id}
