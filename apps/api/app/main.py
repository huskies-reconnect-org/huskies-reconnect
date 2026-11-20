from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import db
from app.config import get_settings
from app.routers import courses, health, icebreakers, matches, users

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.pool = db.create_pool()
    if db.pool is not None:
        await db.pool.open()
    yield
    if db.pool is not None:
        await db.pool.close()


app = FastAPI(title="Huskies Reconnect API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(matches.router)
app.include_router(icebreakers.router)
