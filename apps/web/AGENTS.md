<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Huskies Reconnect UI

Before you build or change a screen in this app, read [../../AGENTS.md](../../AGENTS.md), then [../../docs/ui/README.md](../../docs/ui/README.md) and [../../docs/ui/rules.md](../../docs/ui/rules.md).

- Components: `src/components/ui/`, imported from `@/components/ui`. Guide: [../../docs/ui/components.md](../../docs/ui/components.md).
- Tokens: `src/app/globals.css`. Tailwind's default colors, fonts, sizes, radii, shadows, blur and animations are removed on purpose, so only the Huskies tokens compile.
- Live reference: run `npm run dev` and open `/ui`. Its example data (`src/app/ui/_data.ts`) is for that page only; never import it from a product route.
- Missing something? Propose it, show a mockup, and wait for a yes before adding it. See "Growing the library" in rules.md.
