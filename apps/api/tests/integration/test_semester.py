import math
import uuid

import pytest

from app.config import get_settings
from app.embeddings import EMBED_DIM, to_pgvector
from app.icebreakers import get_generator
from app.main import app
from app.routers import icebreakers as ib_router


def vec(*w):
    v = list(w) + [0.0] * (EMBED_DIM - len(w))
    n = math.sqrt(sum(x * x for x in v))
    return to_pgvector([x / n for x in v])


@pytest.fixture
def admin_email(monkeypatch):
    monkeypatch.setattr(get_settings(), "admin_emails", "")
    def _set(email):
        monkeypatch.setattr(get_settings(), "admin_emails", f"other@northeastern.edu, {email.upper()}")
    return _set


@pytest.fixture
def world(db, make_user):
    course = str(db.execute("select id from public.courses where code = 'CS5100'").fetchone()[0])
    def student(name, embedding):
        uid = make_user(name)
        db.execute("""update public.users set full_name = %s, major = 'CS', interests = 'NLP', goals = 'study',
                      embedding = %s::extensions.vector, embedding_model = 'test#ig1' where id = %s""", (name, embedding, uid))
        db.execute("insert into public.course_members (user_id, course_id) values (%s, %s)", (uid, course))
        return uid
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    my_email = db.execute("select email from public.users where id = %s", (me,)).fetchone()[0]
    return course, me, bob, my_email


def test_non_admin_is_403(client, world, admin_email):
    course, me, _, _ = world
    client.login(me)
    assert client.post(f"/courses/{course}/semester", json={"action": "end"}).status_code == 403


def test_end_then_reset(client, world, admin_email, db):
    course, me, bob, my_email = world
    admin_email(my_email)
    client.login(me)
    assert client.get("/me").json()["is_admin"] is True

    r = client.post(f"/courses/{course}/semester", json={"action": "end"})
    assert r.status_code == 200 and r.json()["status"] == "alumni" and r.json()["members_updated"] == 2
    assert {c["code"]: c for c in client.get("/courses").json()}["CS5100"]["membership"] == "alumni"
    # Alumni still see each other
    assert [m["user_id"] for m in client.get(f"/courses/{course}/matches").json()] == [bob]
    # Ending again changes nothing
    assert client.post(f"/courses/{course}/semester", json={"action": "end"}).json()["members_updated"] == 0

    r = client.post(f"/courses/{course}/semester", json={"action": "reset"})
    assert r.json()["status"] == "active" and r.json()["members_updated"] == 2
    statuses = {s for (s,) in db.execute("select status from public.course_members").fetchall()}
    assert statuses == {"active"}


def test_icebreaker_after_semester_end_is_reconnect(client, world, admin_email):
    course, me, bob, my_email = world
    admin_email(my_email)

    class Gen:
        model = "fake"
        async def draft(self, sender, classmate, course, reconnecting=False):
            self.reconnecting = reconnecting
            return "Hi Bob! It's been a while since CS5100. Want to catch up over coffee next week?"

    g = Gen()
    app.dependency_overrides[get_generator] = lambda: g
    ib_router._recent.clear()
    client.login(me)
    client.post(f"/courses/{course}/semester", json={"action": "end"})
    r = client.post(f"/courses/{course}/matches/{bob}/icebreaker")
    assert r.status_code == 200 and r.json()["status"] == "ok"
    assert g.reconnecting is True


def test_unknown_course_and_bad_action(client, world, admin_email):
    _, me, _, my_email = world
    admin_email(my_email)
    client.login(me)
    assert client.post(f"/courses/{uuid.uuid4()}/semester", json={"action": "end"}).status_code == 404
    assert client.post(f"/courses/{uuid.uuid4()}/semester", json={"action": "explode"}).status_code == 422


def test_is_admin_false_by_default(client, world, admin_email):
    _, me, _, _ = world
    client.login(me)
    assert client.get("/me").json()["is_admin"] is False
