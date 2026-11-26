from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}




def test_ready_reports_unconfigured_database(monkeypatch):
    from app import db, deps

    class _Keys:
        keys = ["k"]

    class _JWKS:
        def get_jwk_set(self):
            return _Keys()

    monkeypatch.setattr(db, "pool", None)
    monkeypatch.setattr("app.routers.health.get_settings", lambda: type("S", (), {
        "gemini_api_key": "", "supabase_url": "https://x.supabase.co"})())
    monkeypatch.setattr("app.routers.health.get_jwks_client", lambda: _JWKS())
    r = client.get("/health/ready")
    assert r.status_code == 503
    assert r.json()["checks"] == {"database": "not_configured", "auth_keys": "ok", "gemini": "not_configured"}
    assert r.json()["version"]
