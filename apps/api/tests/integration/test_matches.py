import math
import uuid

import pytest

from app.config import get_settings
from app.embeddings import EMBED_DIM, to_pgvector


def vec(*weights: float) -> str:
    """Unit vector whose first len(weights) components are the given weights."""
    v = list(weights) + [0.0] * (EMBED_DIM - len(weights))
    n = math.sqrt(sum(x * x for x in v))
    return to_pgvector([x / n for x in v])


@pytest.fixture
def course(db):
    return str(db.execute("select id from public.courses where code = 'CS5100'").fetchone()[0])


@pytest.fixture
def other_course(db):
    return str(db.execute("select id from public.courses where code = 'CS5200'").fetchone()[0])


@pytest.fixture
def student(db, make_user):
    def _make(name, embedding, *courses, status="active"):
        uid = make_user(name)
        db.execute(
            """update public.users set full_name = %s, major = 'CS', interests = 'x', goals = 'y',
                      embedding = %s::extensions.vector where id = %s""",
            (name, embedding, uid))
        for c in courses:
            db.execute("insert into public.course_members (user_id, course_id, status) values (%s, %s, %s)",
                       (uid, c, status))
        return uid
    return _make


def test_ranked_by_similarity_and_excludes_self(client, student, course):
    me = student("me", vec(1, 0), course)
    close = student("close", vec(0.9, 0.1), course)
    mid = student("mid", vec(0.7, 0.3), course)
    client.login(me)

    r = client.get(f"/courses/{course}/matches")
    assert r.status_code == 200
    ids = [m["user_id"] for m in r.json()]
    assert ids == [close, mid]
    sims = [m["similarity"] for m in r.json()]
    assert sims[0] > sims[1] and sims[0] == pytest.approx(0.9 / math.sqrt(0.82), abs=1e-4)


def test_only_same_course_and_active_with_embeddings(client, student, make_user, db, course, other_course):
    me = student("me", vec(1, 0), course)
    student("other-course", vec(1, 0), other_course)
    student("alumni", vec(1, 0), course, status="alumni")
    no_embedding = make_user("no-embedding")
    db.execute("insert into public.course_members (user_id, course_id) values (%s, %s)", (no_embedding, course))
    keep = student("keep", vec(1, 0.05), course)
    client.login(me)
    assert [m["user_id"] for m in client.get(f"/courses/{course}/matches").json()] == [keep]


def test_below_relevance_bar_excluded(client, student, course, monkeypatch):
    monkeypatch.setattr(get_settings(), "match_min_similarity", 0.5)
    me = student("me", vec(1, 0), course)
    student("orthogonal", vec(0, 1), course)      # similarity 0
    student("opposite", vec(-1, 0), course)       # similarity -1
    ok = student("ok", vec(1, 1), course)         # ~0.707
    client.login(me)
    assert [m["user_id"] for m in client.get(f"/courses/{course}/matches").json()] == [ok]


def test_limit(client, student, course):
    me = student("me", vec(1, 0), course)
    for i in range(6):
        student(f"s{i}", vec(1, 0.01 * (i + 1)), course)
    client.login(me)
    assert len(client.get(f"/courses/{course}/matches?limit=3").json()) == 3
    assert client.get(f"/courses/{course}/matches?limit=0").status_code == 422


def test_response_fields(client, student, course):
    me = student("me", vec(1, 0), course)
    student("Bob", vec(1, 0.1), course)
    client.login(me)
    m = client.get(f"/courses/{course}/matches").json()[0]
    assert set(m) == {"user_id", "full_name", "major", "grad_year", "interests", "goals", "similarity"}
    assert "email" not in m


def test_non_member_is_403(client, student, course, other_course):
    me = student("me", vec(1, 0), other_course)
    client.login(me)
    assert client.get(f"/courses/{course}/matches").status_code == 403


def test_alumni_member_is_403(client, student, course):
    me = student("me", vec(1, 0), course, status="alumni")
    client.login(me)
    assert client.get(f"/courses/{course}/matches").status_code == 403


def test_no_profile_embedding_is_409(client, make_user, db, course):
    me = make_user("me")
    db.execute("insert into public.course_members (user_id, course_id) values (%s, %s)", (me, course))
    client.login(me)
    assert client.get(f"/courses/{course}/matches").status_code == 409


def test_unknown_course_is_404(client, student, course):
    client.login(student("me", vec(1, 0), course))
    assert client.get(f"/courses/{uuid.uuid4()}/matches").status_code == 404
