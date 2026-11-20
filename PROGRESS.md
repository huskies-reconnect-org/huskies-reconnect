# Progress Log

Newest entries at the bottom. Each entry: date, what's done, how it was verified.

## 2026-11-15
- Repo scaffold (`apps/api`, `apps/web`, `schema/`), `.gitignore`, `.env.example`.
- FastAPI skeleton (`/health`, `/me`), deployed to Render. Verified: deployed `/health` returns 200.
- Supabase schema: `users`, `courses`, `course_members`, signup trigger, row-level security, pgvector. Verified on a local Postgres (trigger, access rules, check constraints), then pushed.

## 2026-11-16
- Login flow: `/login` (email → 6-digit code), FastAPI verifies Supabase tokens (ES256 keys), `/me` reads `public.users`.
- Signup hook rejecting non-`@northeastern.edu` emails. Verified locally and seen running in Supabase auth logs.
- psycopg bumped to 3.3.9 (3.2.9 had no wheels for Python 3.14+).
- 10 API tests passing; frontend type-checks, lints and builds.

## 2026-11-19
- Diagnosed email failure from Supabase auth logs: Resend's test sender only delivers to the account owner's address (was a Gmail account). Fix in progress: Resend re-registered with NU email.
- Re-planned as a solo thin slice for the Dec 5 demo; rewrote `TASKS.md`.
- Added `/health/ready`: reports whether the API can reach Postgres and Supabase's signing keys (ok / error / not_configured, no values). Verified locally: both ok.
- Merged PR #7 (Phase 1 backbone) into `main`; issues #3 and #4 closed.
- Deployed `/health/ready` on Render: `auth_keys` ok, `database` error. Likely the unencoded `@` in Render's `DATABASE_URL`; dashboard fix pending.

## 2026-11-20
- **To-do #2, course join:** 8 preloaded Fall 2026 courses (migration, pushed to Supabase), `GET /courses` and idempotent `POST /courses/{id}/join`, `/courses` page with Join buttons, shared `api()` helper and login guard.
- Added integration tests that run against a real Postgres rebuilt from the migrations (`scripts/test-db.sh`). Verified: 18 tests pass (7 new: list, join, per-user `joined`, idempotency, 404, 422, 409, 401); frontend type-checks, lints, builds; 8 courses confirmed in the hosted database. Browser check of `/courses` pending.
- Added CI (GitHub Actions, PR #9): API unit + integration tests on Postgres 17 + pgvector, web lint/type-check/build. Verified: all 18 tests ran in CI, none skipped.
- **To-do #3, profile + embeddings (PR #10):** profile fields and a 768-dim embedding column (migration pushed; columns confirmed in Supabase), `PUT /me/profile` embedding with `gemini-embedding-2`, `/profile` page. Verified: 39 tests pass in CI (Gemini client against a mock transport; profile saving against real Postgres + pgvector). **Not yet verified against the live Gemini API:** waiting on `GEMINI_API_KEY`.
