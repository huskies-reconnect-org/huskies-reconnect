# apps/api

FastAPI backend. Python 3.12.

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp ../../.env.example .env        # fill in SUPABASE_URL, DATABASE_URL, CORS_ORIGINS
uvicorn app.main:app --reload     # http://localhost:8000  (docs at /docs)
```

## Tests
```bash
pytest                                   # unit tests; integration tests skip
eval "$(scripts/test-db.sh start)"       # throwaway local Postgres
pytest                                   # now runs integration tests too
scripts/test-db.sh stop
```
Integration tests need pgvector in the test database (CI uses `pgvector/pgvector:pg17`); without it they skip.
They rebuild the schema from `schema/supabase/migrations/` on every run.
**Never point `TEST_DATABASE_URL` at the Supabase project**: the tests wipe the database.

## Endpoints
| Method | Path | Auth | What |
|---|---|---|---|
| GET | `/health` | no | Liveness (Render health check) |
| GET | `/health/ready` | no | Can reach Postgres and Supabase signing keys |
| GET | `/me` | yes | Current user's profile row |
| GET | `/courses` | yes | Course list with member counts and `joined` |
| POST | `/courses/{id}/join` | yes | Join a course (idempotent) |
| GET | `/courses/{id}/matches` | yes | Classmates ranked by profile similarity (members only, above `MATCH_MIN_SIMILARITY`) |
| PUT | `/me/profile` | yes | Save profile; re-embeds via Gemini when major/interests/goals change |
