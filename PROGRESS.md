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
- Render fixed by Poornima: `DATABASE_URL` was missing `:5432/postgres`, branch switched to `main`, `GEMINI_API_KEY` and `ADMIN_EMAILS` added. Verified from outside: `/health/ready` database + auth keys ok, all 9 routes live, schema includes PR #14 and #16 changes.
- `/health/ready` now also checks the Gemini key (lists one model; no generation quota used).
- **Security:** Vercel blocked the deploy for CVE-2025-66478 (React flight RCE) on Next.js 15.3.3. `npm audit` also listed many other Next.js advisories through 15.5.28. Upgraded to **Next.js 15.5.29** (latest 15.x; minor upgrade), `eslint-config-next` 15.5.29, `@supabase/supabase-js` 2.119.2; overrides for `sharp` 0.35.5 (inside Next's supported range) and Next's bundled `postcss` 8.5.33. Verified: `npm audit` 0 vulnerabilities, `npm ci` clean, tsc/lint/build pass, production server serves every page with Tailwind CSS compiled.
- **Frontend live on Vercel:** https://huskies-reconnect.vercel.app (PR #18's Vercel checks passed; production serves the app). Verified: login page renders; compiled bundles point at the Render API and the Supabase project. Pending: Render `CORS_ORIGINS` (preflight from the Vercel origin currently gets 400) and Supabase Site URL.
- CORS rechecked after Poornima set `CORS_ORIGINS`: Vercel origin and localhost allowed (200), unknown origin rejected (400); a real `GET /me` from the Vercel origin returns 401 with the right CORS header.

## 2026-11-20 (cont.)
- Real login kept as is for now (Poornima will revisit a testing bypass later).
- Added `scripts/smoke_live.py`: runs the API in-process as demo student Maya against **live Supabase + Gemini**, bypassing login only inside the script. Verified: 28/28 checks pass. Course join (403 before, idempotent join), matching in CS5100 (3 of 7 above the bar: Aisha 0.873 good, Daniel 0.833 and Jordan 0.827 possible; ranked, no self, no emails), icebreaker (safe, uses the name, accurate shared interest; 409 below the bar), semester end (non-admin 403, alumni keep the same classmates, reconnect tone, undo). All changes restored exactly.
- **Bug found by live testing:** the safety check's "AI talking about itself" rule blocked any draft containing "language model", which rejected good intros about LLM topics (Aisha's "language model safety"), and "I cannot" would have blocked "I cannot wait". Narrowed both to self-reference and refusal phrases, with tests for each.
- Reconnect prompt now requires past tense for the course (a draft had said "I hope your semester is going well" after it ended). Verified on 4 live reconnect drafts.
- Live sweep: 14 drafts across random demo pairs (a third reconnecting): 14/14 pass the safety check, all address the classmate by name, 57–72 words. `smoke_live.py` still 28/28.
- **Found: Gemini free-tier rate limit.** A rerun of `smoke_live.py` failed with a 503. Added error detail to logs and to the smoke output, and the next failure showed `429 too_many_requests`: **15 requests/min** for `gemini-3.5-flash-lite` on the free tier, with `Retry-After`. Our quick retries just used up more requests. Now a 429 waits inline only if `Retry-After` is 5 s or less; otherwise the API returns **429 "The AI is busy right now. Try again in N seconds."** with `Retry-After`. Verified live: the 14th draft in a minute is refused in 0.2 s with `retry_after=33`; after the reset `smoke_live.py` passes 28/28.

## 2026-11-25
- **To-do #1 complete:** login emails now come from `login@huskiesreconnect.app` (domain verified in Resend by Poornima). Confirmed the DKIM, SPF and MX records in public DNS; no DMARC record yet (optional, helps Outlook deliverability). Live usage confirms sign-in works: 2 real accounts have confirmed emails and saved profiles with embeddings.
- **Gemini stays on the free tier** (15 requests/min for `gemini-3.5-flash-lite`); billing setup failed on Poornima's side. Revisit only if rate limits show up in rehearsal.
- GitHub cleanup: closed issues #5 (login) and #6 (deploy) as done; closed PR #1 (an obsolete task claim on the old board). PR #2 (a teammate's UI design system on Next.js 16) left open pending a decision.
- PR #2 stays open by decision: finish rehearsal on the current UI first, then maybe port selected components (added as optional to-do #9).
- **To-do #8 started:** `scripts/predemo_check.py` (read-only go / no-go: wakes Render, readiness, Vercel, CORS, demo data, presenter's profile and matches; no Gemini quota) and `docs/demo-script.md` (~4-minute click path, talking points, fallbacks, likely questions). Verified: the check reports GO for services and demo data; with the presenter flag it correctly flags that Poornima's account has no profile, isn't in CS5100 and has 0 matches yet. Render was already warm (0.2 s), so cold start is still unmeasured.

## 2026-11-25 (rehearsal)
- Pre-demo check: **GO**, with Poornima as presenter (profile set, in CS5100, 3 matches).
- Rehearsal feedback: pre-semester intros for Maya and Helly were specific and natural; UI and the alumni banner read well. **Bug:** after "Simulate semester end", Maya's intro was still present tense ("Since we're both in CS5100… share notes").
- **Root cause:** the Nov 20 "fix" only added a rule triggered by a `reconnecting` true/false field inside the profile JSON, while the shared rules still said "students who are in the same course" and suggested "a study session… or a quick chat after class". The model sometimes followed those instead (reproduced: 1 of 5 drafts through the endpoint slipped). The Nov 20 verification called the generator directly with only 4 samples, and `smoke_live.py` checked only that a draft came back, not its tense.
- **Fix:** shared rules are now tense-neutral; each request starts with an explicit "Situation" line (current: you're both taking it now; reconnect: you took it together last semester, past tense, suggest catching up, not studying). A new `check_reconnect_tone` rejects reconnect drafts that treat the course as ongoing or lack catch-up framing, and the endpoint redrafts once, so a present-tense reconnect draft is never shown. The prompt also forbids invented shared memories ("class notes", "assignments we pushed through" appeared in samples). `smoke_live.py` now checks reconnect tone. `/health/ready` reports the deployed git commit (`version`).
- Verified live: prompt alone 10/10 reconnect drafts correct on the first try (one false positive in my first tone regex, "we're both in the MS CS program", fixed); through the endpoint 5/5 correct with no redraft needed; 6 more samples (4 reconnect, 2 current): tone correct, no invented memories, all safe.

## 2026-11-25 (UI direction)
- Ported three components from Shaad's design system (PR #2) in PR #24 and made them work on phones; Poornima then chose **Helly's UI set** (#25–#30, from her fork) for the final UI. PR #24 closed unmerged; its branch stays for reference.
- **Merged #25** (design tokens, Inter + Space Grotesk fonts, nav bar with an account menu) with a merge commit, so #26–#30 now show only their own changes. Verified before merging: merges cleanly into `main`, lint, type-check and build pass, nothing else used the removed dark-mode tokens, no auth or data code changed.
- Reviewed #26–#30: all five merge together on top of `main` without conflicts; lint, type-check and build pass on the combination. Rendered the combined UI with a mocked API at 360, 390 and 1280 px (home, courses, course page, drafting an intro, semester end, login): no horizontal scrolling anywhere. Some buttons are 40–43 px, just under the 44 px tap minimum; asked Helly to bump the nav ones.
- `predemo_check.py` looked for "Sign in to Huskies Reconnect", which #29 removes; it now checks for the "Northeastern email" field label, present on both the current and the restyled login page (verified on the live site and on #29's build).

## 2026-11-26
- Helly pushed fixes for every review note: #26's intro box now grows to fit (a long intro showed in full at 360 and 390 px), and Copy, Regenerate, Try again, Retry, the nav, demo controls, back links, Join and "Use a different email" are all 44 px. Re-verified #26–#30 combined on `main`: lint, type-check and build pass; mocked-API run at 360, 390 and 1280 px with ok, rate-limited and safety-blocked drafts, simulate and undo semester end: no clipping, no sideways scrolling. **Merged #26–#30** (merge commits).
- **Leave course:** `DELETE /courses/{id}/join` (#33) removes only the caller's membership (active or alumni), idempotent, 404 for unknown courses; 6 new integration tests (137 pass in CI, none skipped); live on Render (unauthenticated call returns 401). Course page button with in-place confirmation, Cancel focused first, back to `/courses` after leaving (#34).
- **Red header and footer (#35):** nav bar and a new footer in the brand red with white text (5.9:1 contrast; disclaimer at 90% white, 4.95:1). Footer is the logo, "Built for Northeastern students." and "A student project, not an official Northeastern service.", with no links. White focus ring on red. Pages now fill the space between nav and footer.
- **Login-page motif (#36):** classmates linked, the links fading "after finals", then redrawn; inline SVG + CSS, about 2 KB, static under reduced motion. Found and fixed: the CSS minifier turned a name-less `animation` shorthand into `none`, so captions never showed; longhands fix it.
- Two local production builds failed inside `next/font` while fetching Google Fonts and passed on a clean retry; main built fine at the same time. A transient Google Fonts glitch, not code. If it happens before the demo, rebuild.

