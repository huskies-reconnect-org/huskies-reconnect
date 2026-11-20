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
- **To-do #4, matching (PR #11):** `GET /courses/{id}/matches` ranks active classmates by cosine similarity of profile embeddings above a relevance bar (`MATCH_MIN_SIMILARITY`, default 0.5); `/courses/[id]` page with match cards. Verified: 48 tests pass in CI (9 new: ranking, exclusions, relevance bar, limit, no email exposed, 403/404/409). The relevance bar still needs tuning against real Gemini vectors (after #5 seeds profiles).
- **To-do #5, demo classmates (PR #12):** `is_demo` column (pushed), seed module and CLI for 8 fictional students (CS5100, 2 also in CS6120) that can't sign in, "Demo profile" label on match cards. Verified: 53 tests pass in CI (seed flags, ban, idempotency, no partial writes on Gemini failure, removal spares real users). **Seeding Supabase is waiting on `GEMINI_API_KEY`**, since the embeddings must be real.
- **To-do #6, icebreaker (PR #13):** "Draft intro" on match cards → `gemini-3.5-flash-lite` (Gemini Interactions API) → layered safety check (Gemini filters enabled, profiles passed as data against prompt injection, our own output check with one retry) → shown with Copy / Regenerate. Only for pairs above the relevance bar; 10 drafts per 10 min per user. Verified: 89 tests pass in CI. **Not yet verified against live Gemini** (key pending); the response parsing needs one real call to confirm.
- **To-do #7 (stretch), simulate semester end:** admin-only (`ADMIN_EMAILS`) `POST /courses/{id}/semester` to end or undo; alumni keep seeing former classmates (matches are within the same cohort); intros switch to a "reconnecting" tone; alumni banner, badge and demo controls in the UI.
- README refreshed to match what's built (PR #15).
- **Live Gemini verified** (key added): `embedContent` returns `embedding.values` (768 dims, already unit-norm); Interactions returns a `thought` step plus a `model_output` step, and our parser reads the right one. 5 real icebreakers drafted in 1–3.5 s, all passed the safety check; reconnect tone works; a prompt-injection profile asking for a link and email was ignored.
- Found: `gemini-embedding-2` intermittently returns **403 PERMISSION_DENIED** for a valid key (2 of 30 calls in a burst; the next call succeeds). Both Gemini clients now retry 403/429/5xx up to 3 attempts with a short backoff.
- Found: with labeled text including the major, every pair scored 0.87–0.98 and an unrelated accounting profile showed as an "89% match". Switched the embedded text to plain interests + goals (spread 0.75–0.96), raised the relevance bar 0.5 → 0.82, and show Strong / Good / Possible instead of a percentage. Embeddings are tagged with a format version (`gemini-embedding-2#ig1`) and only same-version vectors are compared.
- Seeded 8 demo students into Supabase. Verified matches against the live data: an NLP profile gets 5 (1 strong), a robotics profile 1 (strong), an unrelated accounting profile 1 borderline "possible".
