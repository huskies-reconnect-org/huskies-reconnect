# Huskies Reconnect: Task Board 🐾

Solo build. **Demo: Dec 5, 2026.**

Goal: one working flow on the deployed site: **sign in → join course → see a match → get an icebreaker.**
Simplified or preloaded pieces are fine where they don't weaken that flow. Progress log: [`PROGRESS.md`](PROGRESS.md).

## To-do (in order)

1. [x] **Ship the foundation**
   - [x] Email sending via Resend from `login@huskiesreconnect.app` (custom domain verified)
   - [x] Frontend deployed to Vercel: https://huskies-reconnect.vercel.app
   - [x] Render env vars confirmed (`/health/ready` returns ok)
   - [x] PR #7 merged into `main`
2. [x] **Course join:** list + join endpoints, one page with Join buttons, preloaded course list
3. [x] **Profile + embeddings:** form (major, interests, goals), embedding via Gemini API stored in pgvector
4. [x] **Matching page:** pgvector similarity among classmates in the same course
5. [x] **Demo classmates:** ~8 seeded students with realistic profiles (`is_demo` flag)
6. [x] **Icebreaker:** "Draft intro" button → Gemini → safety check → shown on screen
7. [x] **Stretch, only if time allows:** "Simulate semester end" button (course becomes an alumni group)
8. [ ] **Rehearsal:** full pass on the deployed site, bug fixes, demo script
9. [ ] **UI polish: Helly's UI set (#25–#30).** Chosen over the port of Shaad's components (PR #24, closed unmerged; branch kept for reference). PR #2 stays open; it isn't merged as is.
   - [x] #25 design tokens, fonts, nav bar (merged Nov 25)
   - [ ] #26 match card with editable intro
   - [ ] #27 course page and alumni banner
   - [ ] #28 courses list
   - [ ] #29 login and code screens
   - [ ] #30 home page
   - [ ] Tap targets to 44px for the phone demo (asked Helly on #25)
   - [ ] After #29 lands: rerun `predemo_check.py` (its login check now looks for the field label, which both versions have)

## Deliberately out of scope for Dec 5
- LangGraph pipeline orchestration and LangSmith tracing
- Real resurfacing scheduler (#7 simulates it)
- Match feedback tracking (accepted / ignored)
- Course search
- Responsive design and visual polish beyond "clean and usable"

## How work lands
- Small PRs, merged into `main` quickly; `main` is always deployable and is what Vercel and Render deploy.
- Every completed item gets a dated entry in `PROGRESS.md`.
