# apps/web

The Huskies Reconnect frontend: Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

## What is here

| Path | What it is |
|---|---|
| `src/app/layout.tsx` | Root layout, Recursive font, default page title |
| `src/app/globals.css` | Design tokens and the three type voices |
| `src/app/page.tsx` | Signed-out landing page |
| `src/app/not-found.tsx` | Custom 404 |
| `src/app/icon.svg` | Favicon |
| `src/app/ui/` | `/ui`, the live component reference (example data lives here only) |
| `src/components/ui/` | The UI library, exported from `index.ts` |
| `src/lib/cn.ts` | Class name helper |

## Building a feature

Start with the repo's [AGENTS.md](../../AGENTS.md) and [docs/ui](../../docs/ui/README.md). Each task in TASKS.md has a recipe in [docs/ui/recipes.md](../../docs/ui/recipes.md) with the route, components, states and copy.
