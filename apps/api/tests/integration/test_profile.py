import pytest

PROFILE = {
    "full_name": "Alice Chen",
    "major": "MS Computer Science",
    "grad_year": 2027,
    "interests": "NLP, rock climbing, building developer tools",
    "goals": "Find a study group for CS6120 and a co-founder for a side project",
}


def test_new_user_profile_is_incomplete(client, make_user):
    client.login(make_user("alice"))
    me = client.get("/me").json()
    assert me["profile_complete"] is False and me["matchable"] is False


def test_save_profile_embeds_and_stores_vector(client, make_user, db, embedder):
    uid = make_user("alice")
    client.login(uid)
    r = client.put("/me/profile", json=PROFILE)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["embedding_status"] == "updated"
    assert body["profile_complete"] is True and body["matchable"] is True
    assert body["interests"] == PROFILE["interests"]

    dims, model, norm = db.execute(
        "select extensions.vector_dims(embedding), embedding_model, extensions.vector_norm(embedding)"
        " from public.users where id = %s", (uid,)).fetchone()
    assert dims == 768 and model == "fake-embedding#ig1"
    assert norm == pytest.approx(1.0, abs=1e-5)
    assert embedder.calls == 1


def test_unchanged_profile_skips_embedding(client, make_user, embedder):
    client.login(make_user())
    client.put("/me/profile", json=PROFILE)
    r = client.put("/me/profile", json={**PROFILE, "full_name": "Alice C.", "major": "MS AI"})  # not embedded
    assert r.json()["embedding_status"] == "unchanged"
    assert embedder.calls == 1


def test_outdated_embedding_format_is_redone_even_if_text_unchanged(client, make_user, embedder, db):
    uid = make_user()
    client.login(uid)
    client.put("/me/profile", json=PROFILE)
    db.execute("update public.users set embedding_model = 'fake-embedding#old' where id = %s", (uid,))
    assert client.put("/me/profile", json=PROFILE).json()["embedding_status"] == "updated"
    assert embedder.calls == 2


def test_changed_interests_re_embed(client, make_user, embedder):
    client.login(make_user())
    client.put("/me/profile", json=PROFILE)
    r = client.put("/me/profile", json={**PROFILE, "interests": "Distributed systems"})
    assert r.json()["embedding_status"] == "updated"
    assert embedder.calls == 2


def test_embedding_failure_still_saves_profile(client, make_user, embedder):
    client.login(make_user())
    embedder.fail = True
    r = client.put("/me/profile", json=PROFILE)
    assert r.status_code == 200
    assert r.json()["embedding_status"] == "failed"
    assert r.json()["matchable"] is False
    assert client.get("/me").json()["goals"] == PROFILE["goals"]


def test_failure_after_success_keeps_previous_embedding(client, make_user, embedder, db):
    uid = make_user()
    client.login(uid)
    client.put("/me/profile", json=PROFILE)
    embedder.fail = True
    r = client.put("/me/profile", json={**PROFILE, "goals": "Something new"})
    assert r.json()["embedding_status"] == "failed"
    assert r.json()["matchable"] is True
    assert db.execute("select embedding_model from public.users where id = %s", (uid,)).fetchone()[0] == "fake-embedding#ig1"


@pytest.mark.parametrize("patch", [
    {"interests": "   "},           # whitespace only
    {"goals": "x" * 501},           # too long
    {"major": ""},                  # empty
    {"grad_year": 1999},            # out of range
])
def test_invalid_profile_is_422(client, make_user, patch):
    client.login(make_user())
    assert client.put("/me/profile", json={**PROFILE, **patch}).status_code == 422


def test_profile_input_is_trimmed(client, make_user):
    client.login(make_user())
    r = client.put("/me/profile", json={**PROFILE, "major": "  Data Science  "})
    assert r.json()["major"] == "Data Science"


def test_avatar_color_and_badge_saved_and_returned(client, make_user, embedder):
    client.login(make_user())
    r = client.put("/me/profile", json={**PROFILE, "avatar_color": "sky", "avatar_badge": "NLP"})
    assert r.status_code == 200, r.text
    assert r.json()["avatar_color"] == "sky" and r.json()["avatar_badge"] == "NLP"
    assert r.json()["embedding_status"] == "updated"
    me = client.get("/me").json()
    assert me["avatar_color"] == "sky" and me["avatar_badge"] == "NLP"
    # Changing only the look doesn't re-embed.
    r = client.put("/me/profile", json={**PROFILE, "avatar_color": "mint"})
    assert r.json()["embedding_status"] == "unchanged" and embedder.calls == 1
    assert r.json()["avatar_color"] == "mint" and r.json()["avatar_badge"] is None


def test_avatar_defaults_to_none(client, make_user):
    client.login(make_user())
    r = client.put("/me/profile", json=PROFILE)
    assert r.json()["avatar_color"] is None and r.json()["avatar_badge"] is None


@pytest.mark.parametrize("patch", [{"avatar_color": "neon"}, {"avatar_badge": "x" * 101}, {"avatar_badge": "  "}])
def test_invalid_avatar_is_422(client, make_user, patch):
    client.login(make_user())
    assert client.put("/me/profile", json={**PROFILE, **patch}).status_code == 422

