import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient

from app import deps
from app.config import get_settings
from app.db import get_conn
from app.main import app

ISS = f"{get_settings().supabase_url.rstrip('/')}/auth/v1"
USER_ID = "00000000-0000-0000-0000-00000000000a"

_private = ec.generate_private_key(ec.SECP256R1())
_other = ec.generate_private_key(ec.SECP256R1())


class _FakeJWKS:
    def get_signing_key_from_jwt(self, token):
        return type("K", (), {"key": _private.public_key()})()


def make_token(key=_private, **overrides):
    claims = {
        "sub": USER_ID,
        "email": "alice@northeastern.edu",
        "aud": "authenticated",
        "iss": ISS,
        "exp": int(time.time()) + 300,
    }
    claims.update(overrides)
    return jwt.encode(claims, key, algorithm="ES256")


class _FakeCursor:
    def __init__(self, row):
        self.row, self.factory = row, None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *a):
        return False

    async def execute(self, *a):
        pass

    async def fetchone(self):
        return None if self.row is None else self.factory(**self.row)


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(deps, "get_jwks_client", lambda: _FakeJWKS())
    yield TestClient(app)
    app.dependency_overrides.clear()


def _use_db_row(row):
    from app.routers.users import Me

    class Conn:
        def cursor(self, row_factory):
            cur = _FakeCursor(row)
            cur.factory = Me
            return cur

    async def fake_conn():
        yield Conn()

    app.dependency_overrides[get_conn] = fake_conn


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def test_valid_token_returns_profile(client):
    _use_db_row({"id": USER_ID, "email": "alice@northeastern.edu",
                 "full_name": "Alice", "major": None, "grad_year": None})
    r = client.get("/me", headers=auth(make_token()))
    assert r.status_code == 200
    assert r.json()["id"] == USER_ID


def test_missing_profile_row_is_404(client):
    _use_db_row(None)
    assert client.get("/me", headers=auth(make_token())).status_code == 404


@pytest.mark.parametrize(
    "token",
    [
        make_token(exp=int(time.time()) - 10),        # expired
        make_token(aud="anon"),                        # wrong audience
        make_token(iss="https://evil.example/auth/v1"),  # wrong issuer
        make_token(key=_other),                        # wrong signing key
        "not-a-jwt",
    ],
    ids=["expired", "audience", "issuer", "signature", "garbage"],
)
def test_bad_tokens_are_401(client, token):
    assert client.get("/me", headers=auth(token)).status_code == 401


def test_missing_token_is_401(client):
    assert client.get("/me").status_code == 401


def test_non_northeastern_email_is_403(client):
    r = client.get("/me", headers=auth(make_token(email="x@gmail.com")))
    assert r.status_code == 403
