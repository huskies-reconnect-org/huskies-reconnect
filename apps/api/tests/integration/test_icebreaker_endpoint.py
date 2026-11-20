import math
import uuid

import pytest

from app.embeddings import EMBED_DIM, to_pgvector
from app.icebreakers import GenerationBlocked, GenerationError, get_generator
from app.main import app
from app.routers import icebreakers as ib_router

GOOD = "Hi Bob! We're both in CS5100 and into NLP. Want to set up a study session before the midterm?"


def vec(*w):
    v = list(w) + [0.0] * (EMBED_DIM - len(w))
    n = math.sqrt(sum(x * x for x in v))
    return to_pgvector([x / n for x in v])


class FakeGenerator:
    model = "fake-gen"

    def __init__(self):
        self.outputs: list = [GOOD]
        self.calls = []

    async def draft(self, sender, classmate, course, reconnecting=False):
        self.calls.append((sender, classmate, course))
        self.reconnecting = reconnecting
        out = self.outputs.pop(0) if len(self.outputs) > 1 else self.outputs[0]
        if isinstance(out, Exception):
            raise out
        return out


@pytest.fixture
def gen(client):
    g = FakeGenerator()
    app.dependency_overrides[get_generator] = lambda: g
    ib_router._recent.clear()
    return g


@pytest.fixture
def setup(db, make_user):
    course = str(db.execute("select id from public.courses where code = 'CS5100'").fetchone()[0])
    other = str(db.execute("select id from public.courses where code = 'CS5200'").fetchone()[0])

    def student(name, embedding, course_id=course):
        uid = make_user(name)
        db.execute("""update public.users set full_name = %s, major = 'CS', interests = 'NLP', goals = 'study',
                      embedding = %s::extensions.vector, embedding_model = 'test#ig1' where id = %s""", (name, embedding, uid))
        if course_id:
            db.execute("insert into public.course_members (user_id, course_id) values (%s, %s)", (uid, course_id))
        return uid
    return course, other, student


def url(course, them):
    return f"/courses/{course}/matches/{them}/icebreaker"


def test_drafts_intro_for_a_match(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    client.login(me)
    r = client.post(url(course, bob))
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "message": GOOD, "model": "fake-gen"}
    sender, classmate, course_name = gen.calls[0]
    assert sender.full_name == "Alice" and classmate.full_name == "Bob"
    assert course_name.startswith("CS5100 ")


def test_unsafe_draft_is_retried_then_shown(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    gen.outputs = ["Find me at https://spam.example", GOOD]
    client.login(me)
    r = client.post(url(course, bob)).json()
    assert r["status"] == "ok" and r["message"] == GOOD and len(gen.calls) == 2


def test_unsafe_twice_is_blocked_and_never_returned(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    gen.outputs = ["Email bob@spam.example now"]
    client.login(me)
    r = client.post(url(course, bob)).json()
    assert r == {"status": "blocked", "message": None, "model": "fake-gen"}


def test_gemini_filter_block(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    gen.outputs = [GenerationBlocked("safety")]
    client.login(me)
    assert client.post(url(course, bob)).json()["status"] == "blocked"


def test_generation_failure_is_503(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    gen.outputs = [GenerationError("down")]
    client.login(me)
    assert client.post(url(course, bob)).status_code == 503


def test_below_relevance_bar_is_409(client, gen, setup):
    course, _, student = setup
    me, far = student("Alice", vec(1, 0)), student("Far", vec(0, 1))
    client.login(me)
    assert client.post(url(course, far)).status_code == 409
    assert gen.calls == []


def test_classmate_in_other_course_is_404(client, gen, setup):
    course, other, student = setup
    me, elsewhere = student("Alice", vec(1, 0)), student("Else", vec(1, 0), course_id=other)
    client.login(me)
    assert client.post(url(course, elsewhere)).status_code == 404


def test_self_is_404(client, gen, setup):
    course, _, student = setup
    me = student("Alice", vec(1, 0))
    client.login(me)
    assert client.post(url(course, me)).status_code == 404


def test_non_member_is_403(client, gen, setup):
    course, other, student = setup
    me, bob = student("Alice", vec(1, 0), course_id=other), student("Bob", vec(1, 0))
    client.login(me)
    assert client.post(url(course, bob)).status_code == 403


def test_no_profile_is_409(client, gen, setup, make_user, db):
    course, _, student = setup
    me = make_user("me")
    db.execute("insert into public.course_members (user_id, course_id) values (%s, %s)", (me, course))
    bob = student("Bob", vec(1, 0))
    client.login(me)
    assert client.post(url(course, bob)).status_code == 409


def test_unknown_course_is_404(client, gen, setup):
    _, _, student = setup
    me = student("Alice", vec(1, 0))
    client.login(me)
    assert client.post(url(uuid.uuid4(), uuid.uuid4())).status_code == 404


def test_rate_limited(client, gen, setup):
    course, _, student = setup
    me, bob = student("Alice", vec(1, 0)), student("Bob", vec(1, 0.1))
    client.login(me)
    codes = [client.post(url(course, bob)).status_code for _ in range(11)]
    assert codes[:10] == [200] * 10 and codes[10] == 429
