import asyncio

import pytest
from psycopg import AsyncConnection

from app import demo_seed


def _run(coro_fn, url, *args):
    async def go():
        async with await AsyncConnection.connect(url) as conn:
            return await coro_fn(conn, *args)
    return asyncio.run(go())


def test_seed_creates_flagged_matchable_students(migrated_db, db, embedder):
    assert _run(demo_seed.seed, migrated_db, embedder) == len(demo_seed.STUDENTS)
    rows = db.execute("""select count(*), bool_and(is_demo), bool_and(embedding is not null),
                                bool_and(email like 'demo.%%@northeastern.edu')
                           from public.users""").fetchone()
    assert rows == (8, True, True, True)
    banned = db.execute("select bool_and(banned_until > now() + interval '50 years') from auth.users").fetchone()[0]
    assert banned is True
    cs6120 = db.execute("""select count(*) from public.course_members m join public.courses c on c.id = m.course_id
                            where c.code = 'CS6120'""").fetchone()[0]
    assert cs6120 == 2


def test_seed_is_idempotent(migrated_db, db, embedder):
    _run(demo_seed.seed, migrated_db, embedder)
    _run(demo_seed.seed, migrated_db, embedder)
    assert db.execute("select count(*) from public.users").fetchone()[0] == 8
    assert db.execute("select count(*) from public.course_members").fetchone()[0] == 10


def test_embedding_failure_writes_nothing(migrated_db, db, embedder):
    embedder.fail = True
    with pytest.raises(Exception):
        _run(demo_seed.seed, migrated_db, embedder)
    assert db.execute("select count(*) from public.users").fetchone()[0] == 0


def test_remove_deletes_only_demo_users(migrated_db, db, embedder, make_user):
    real = make_user("real")
    _run(demo_seed.seed, migrated_db, embedder)
    assert _run(demo_seed.remove, migrated_db) == 8
    remaining = [r[0] for r in db.execute("select id::text from public.users").fetchall()]
    assert remaining == [real]


def test_demo_students_appear_in_matches_with_flag(migrated_db, client, embedder, make_user, db):
    _run(demo_seed.seed, migrated_db, embedder)
    me = make_user("me")
    client.login(me)
    cid = db.execute("select id::text from public.courses where code = 'CS5100'").fetchone()[0]
    client.post(f"/courses/{cid}/join")
    client.put("/me/profile", json={"full_name": "Me", "major": "MS Computer Science",
                                    "interests": "NLP", "goals": "study group"})
    from app.config import get_settings
    get_settings().match_min_similarity, old = -1.0, get_settings().match_min_similarity
    try:
        matches = client.get(f"/courses/{cid}/matches?limit=20").json()
    finally:
        get_settings().match_min_similarity = old
    assert len(matches) == 8 and all(m["is_demo"] for m in matches)
