import uuid


def test_list_shows_preloaded_courses(client, make_user):
    client.login(make_user())
    r = client.get("/courses")
    assert r.status_code == 200
    codes = [c["code"] for c in r.json()]
    assert "CS5100" in codes and len(codes) == 8
    assert all(c["joined"] is False and c["member_count"] == 0 for c in r.json())


def _course_id(client, code):
    return next(c["id"] for c in client.get("/courses").json() if c["code"] == code)


def test_join_marks_joined_and_counts(client, make_user):
    alice, bob = make_user("alice"), make_user("bob")
    client.login(alice)
    cid = _course_id(client, "CS5100")

    r = client.post(f"/courses/{cid}/join")
    assert r.status_code == 200
    assert r.json()["joined"] is True and r.json()["member_count"] == 1
    assert r.json()["membership"] == "active"

    client.login(bob)
    listed = {c["code"]: c for c in client.get("/courses").json()}
    assert listed["CS5100"]["member_count"] == 1
    assert listed["CS5100"]["joined"] is False  # joined is per-user
    assert listed["CS5100"]["membership"] is None


def test_join_is_idempotent(client, make_user, db):
    alice = make_user("alice")
    client.login(alice)
    cid = _course_id(client, "CS5200")
    assert client.post(f"/courses/{cid}/join").status_code == 200
    assert client.post(f"/courses/{cid}/join").status_code == 200
    n = db.execute("select count(*) from public.course_members where user_id = %s", (alice,)).fetchone()[0]
    assert n == 1


def test_join_unknown_course_is_404(client, make_user):
    client.login(make_user())
    assert client.post(f"/courses/{uuid.uuid4()}/join").status_code == 404


def test_join_with_bad_id_is_422(client, make_user):
    client.login(make_user())
    assert client.post("/courses/not-a-uuid/join").status_code == 422


def test_join_without_profile_row_is_409(client):
    client.login(str(uuid.uuid4()))  # valid token, but no users row
    cid = _course_id(client, "CS5800")
    assert client.post(f"/courses/{cid}/join").status_code == 409


def test_leave_removes_membership(client, make_user, db):
    alice, bob = make_user("alice"), make_user("bob")
    client.login(alice)
    cid = _course_id(client, "CS5100")
    client.post(f"/courses/{cid}/join")
    client.login(bob)
    client.post(f"/courses/{cid}/join")

    client.login(alice)
    r = client.delete(f"/courses/{cid}/join")
    assert r.status_code == 200
    body = r.json()
    assert body["joined"] is False and body["membership"] is None and body["member_count"] == 1
    assert db.execute("select count(*) from public.course_members where user_id = %s", (alice,)).fetchone()[0] == 0
    # Bob is untouched, and Alice can rejoin.
    assert db.execute("select count(*) from public.course_members where user_id = %s", (bob,)).fetchone()[0] == 1
    assert client.post(f"/courses/{cid}/join").json()["joined"] is True


def test_leave_as_alumni(client, make_user, db):
    alice = make_user("alice")
    client.login(alice)
    cid = _course_id(client, "CS5100")
    client.post(f"/courses/{cid}/join")
    db.execute("update public.course_members set status = 'alumni' where user_id = %s", (alice,))
    assert client.delete(f"/courses/{cid}/join").json()["joined"] is False


def test_leave_is_idempotent(client, make_user):
    client.login(make_user())
    cid = _course_id(client, "CS5200")
    r = client.delete(f"/courses/{cid}/join")  # never joined
    assert r.status_code == 200 and r.json()["joined"] is False


def test_leave_unknown_course_is_404(client, make_user):
    client.login(make_user())
    assert client.delete(f"/courses/{uuid.uuid4()}/join").status_code == 404


def test_leave_then_matches_is_403(client, make_user):
    client.login(make_user())
    cid = _course_id(client, "CS5100")
    client.post(f"/courses/{cid}/join")
    client.delete(f"/courses/{cid}/join")
    assert client.get(f"/courses/{cid}/matches").status_code == 403


def test_courses_require_login(migrated_db):
    from fastapi.testclient import TestClient
    from app.main import app
    c = TestClient(app)
    assert c.get("/courses").status_code == 401
    assert c.delete(f"/courses/{uuid.uuid4()}/join").status_code == 401
