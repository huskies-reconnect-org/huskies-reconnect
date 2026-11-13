# Agent guide

Read this before you change anything in this repo. It is written for coding agents (Claude Code, Codex, Cursor, Copilot) and works just as well for a teammate who is new to the code.

## The project

Huskies Reconnect suggests a few classmates worth meeting in each of a Northeastern student's courses. For each suggestion it shows what the two people share, drafts an intro, and checks the draft for safety before it can be sent. When the semester ends, each course stays open as a class network. Product and team context: [README.md](README.md). Work items and owners: [TASKS.md](TASKS.md).

## Where things are

| Path | What it is | Status |
|---|---|---|
| `apps/web/` | Next.js 16 + Tailwind CSS 4 frontend, including the UI library | Exists |
| `docs/ui/` | UI direction, rules, component guide, copy guide, per-task recipes | Exists |
| `apps/api/`, `packages/ai-pipeline/`, `schema/` | FastAPI backend, LangGraph pipeline, database schema | Planned, see README |

## Before you build any UI

1. Read [docs/ui/README.md](docs/ui/README.md) (the direction and the tokens) and [docs/ui/rules.md](docs/ui/rules.md) (the rules and the PR checklist).
2. Find your task in [docs/ui/recipes.md](docs/ui/recipes.md). It gives the route, the components to use, the states to handle, and the copy.
3. Build with the components in `apps/web/src/components/ui/`. Import them from `@/components/ui`. Run the app and open `/ui` to see every component in its states.
4. If the library is missing something that would make the screen better, you can add it. Ask the person you are working with first, and show them a mockup before you build it. The steps are in [docs/ui/rules.md](docs/ui/rules.md#growing-the-library).
5. Next.js 16 is newer than most training data. Read [apps/web/AGENTS.md](apps/web/AGENTS.md) and check the bundled docs in `apps/web/node_modules/next/dist/docs/` before you use a Next.js API you are not sure about.

## Commands

Run these from `apps/web/`.

```bash
npm install
npm run dev        # http://localhost:3000, component reference at /ui
npm run lint
npx tsc --noEmit
npm run build      # must pass before you open a PR
```

## Working conventions

- Claim a task in TASKS.md and open a matching GitHub issue (see README, "How to contribute").
- Branch names: `phase-N/short-task-name`.
- PRs go into `main`. For UI work, paste the PR checklist from docs/ui/rules.md into the description and add desktop and phone screenshots.
- Do not add UI dependencies (component kits, icon sets, animation or CSS libraries) without asking. Most needs fit the existing library. If one does not, follow "Growing the library".
- Never commit `.env` files, keys, or real student data.

## Next.js notes for this repo

- Cache Components is on (`apps/web/next.config.ts`). In server components, do not call `new Date()`, `Date.now()` or `Math.random()` during render; they break prerendering. See `01-app/01-getting-started/08-caching.md` in the bundled docs.
- `next dev` writes a managed block into `apps/web/AGENTS.md`. Leave it there and commit it.
- Layouts and pages can use the global `LayoutProps<"/route">` and `PageProps<"/route">` types.
