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
| GET | `/courses/{id}/matches` | yes | Classmates ranked by profile similarity (members only, above `MATCH_MIN_SIMILARITY`, labeled strong / good / possible) |
| POST | `/courses/{id}/matches/{classmate_id}/icebreaker` | yes | AI-drafted intro (Gemini) for a pair above the relevance bar; safety-checked; 10 per 10 min per user |
| POST | `/courses/{id}/semester` | admin | `{"action": "end" \| "reset"}`: simulate semester end (members become alumni) or undo |
| PUT | `/me/profile` | yes | Save profile; re-embeds via Gemini when major/interests/goals change |

## Demo classmates
8 fictional students in CS5100 (2 also in CS6120), flagged `is_demo`, with real Gemini embeddings.
They can't sign in (unusable emails, permanently banned in Supabase Auth).
```bash
python scripts/seed_demo.py                  # dry run: shows target DB and students
python scripts/seed_demo.py --yes            # seed or update (needs GEMINI_API_KEY)
python scripts/seed_demo.py --remove --yes   # delete all demo users after the showcase
```
