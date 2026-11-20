"""Integration tests against a real Postgres built from schema/supabase/migrations.

Skipped unless TEST_DATABASE_URL is set (see scripts/test-db.sh). The database is
wiped and rebuilt each session, so never point this at the Supabase project.
"""
import os
import uuid
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient
from psycopg import AsyncConnection

from app.db import get_conn
from app.deps import get_current_user_id
from app.embeddings import get_embedder
from app.main import app

URL = os.environ.get("TEST_DATABASE_URL", "")
MIGRATIONS = Path(__file__).resolve().parents[4] / "schema" / "supabase" / "migrations"

pytestmark = pytest.mark.skipif(not URL, reason="TEST_DATABASE_URL not set")

# Minimal stand-ins for what Supabase provides.
SUPABASE_STUBS = """
do $$ begin
  create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin
  create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin
  create role supabase_auth_admin nologin; exception when duplicate_object then null; end $$;
drop schema if exists public cascade;
drop schema if exists auth cascade;
drop schema if exists extensions cascade;
create schema public;
create schema auth;
create schema extensions;
grant usage on schema public, auth to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
create table auth.users (
  instance_id uuid, id uuid primary key default gen_random_uuid(), aud varchar, role varchar,
  email text, encrypted_password varchar, email_confirmed_at timestamptz,
  raw_app_meta_data jsonb, raw_user_meta_data jsonb, banned_until timestamptz,
  created_at timestamptz, updated_at timestamptz,
  confirmation_token varchar, recovery_token varchar, email_change_token_new varchar, email_change varchar
);
create function auth.uid() returns uuid language sql stable as
  $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
"""


def _adapt(sql: str, conn: psycopg.Connection) -> str:
    """Make migrations runnable on a plain local Postgres."""
    if conn.info.server_version < 150000:
        sql = sql.replace("unique nulls not distinct", "unique")
    return sql


@pytest.fixture(scope="session")
def migrated_db():
    if not URL:
        pytest.skip("TEST_DATABASE_URL not set")
    with psycopg.connect(URL, autocommit=True) as conn:
        if not conn.execute("select 1 from pg_available_extensions where name = 'vector'").fetchone():
            pytest.skip("pgvector not installed in the test database (CI has it)")
        conn.execute(SUPABASE_STUBS)
        for f in sorted(MIGRATIONS.glob("*.sql")):
            conn.execute(_adapt(f.read_text(), conn))
    return URL


@pytest.fixture
def db(migrated_db):
    """Sync connection for arranging/inspecting data; wipes users after each test."""
    with psycopg.connect(migrated_db, autocommit=True) as conn:
        yield conn
        conn.execute("delete from auth.users")  # cascades to users and course_members


@pytest.fixture
def make_user(db):
    def _make(name: str = "student") -> str:
        uid = str(uuid.uuid4())
        db.execute(
            "insert into auth.users (id, email, raw_user_meta_data) values (%s, %s, %s)",
            (uid, f"{name}.{uid[:8]}@northeastern.edu", psycopg.types.json.Jsonb({"full_name": name})),
        )
        return uid
    return _make


class FakeEmbedder:
    """Deterministic stand-in for Gemini: same text -> same unit vector."""
    model = "fake-embedding"

    def __init__(self):
        self.calls = 0
        self.fail = False

    async def embed(self, text: str) -> list[float]:
        from app.embeddings import EMBED_DIM, EmbeddingError, normalize
        self.calls += 1
        if self.fail:
            raise EmbeddingError("simulated outage")
        seed = sum(map(ord, text)) or 1
        return normalize([((seed * (i + 1)) % 97) + 1.0 for i in range(EMBED_DIM)])


@pytest.fixture
def embedder():
    return FakeEmbedder()


@pytest.fixture
def client(migrated_db, embedder):
    """App client whose DB is the test database; log in with client.login(user_id)."""
    async def test_conn():
        async with await AsyncConnection.connect(migrated_db) as conn:
            yield conn

    app.dependency_overrides[get_conn] = test_conn
    app.dependency_overrides[get_embedder] = lambda: embedder
    c = TestClient(app)

    def login(user_id: str):
        app.dependency_overrides[get_current_user_id] = lambda: user_id
    c.login = login
    yield c
    app.dependency_overrides.clear()
