# Huskies Reconnect UI

Start here before you build or change a screen. Then read [rules.md](rules.md).

| Doc | Read it for |
|---|---|
| [rules.md](rules.md) | What must always hold, the defaults, how to grow the library, the PR checklist |
| [components.md](components.md) | Every component: when to use it, its props, an example |
| [copy.md](copy.md) | Voice, the product's words, what to avoid in UI text |
| [recipes.md](recipes.md) | Each TASKS.md item: route, components, states, copy |

## The direction: Study Deck, in Huskies colors

Students already study with index cards, so Huskies Reconnect hands each student a short deck for each course, with one classmate per card. The front of the card says who they are and what you two share. Flip it, and the back holds an intro you can edit and send. Not now moves the card to the back of the deck. When the semester ends the class stays open, and it comes back later as an old card pulled out of the box.

The colors come from the campus sweatshirt: a heather grey table, jersey black for the header and text, Northeastern red for the one action that matters on each screen, and cream index cards for content.

This direction was picked in November 2026 from four mockups (Platform, Varsity, Correspondence, Study Deck). It takes Study Deck's structure and type and Varsity's colors. Study Deck's yellow highlighter became a red marker underline, which keeps school colors and full text contrast.

### Three ideas to carry into every screen

1. **One thing at a time.** A card holds one person. A screen has one red primary action.
2. **Show why.** Every suggestion comes with plain reasons, and the shared thing gets the red marker. Never a match score.
3. **The person stays in control.** Nothing sends until they press Send. Every AI draft is labelled, checked and editable, and Not now is always there.

## Where it lives

| What | Where |
|---|---|
| Tokens | `apps/web/src/app/globals.css` |
| Font loading | `apps/web/src/app/layout.tsx` (Recursive through `next/font`) |
| Components | `apps/web/src/components/ui/`, imported from `@/components/ui` |
| Live reference | `/ui` (run `npm run dev`, open http://localhost:3000/ui). Source in `apps/web/src/app/ui/` |

## Tokens

`globals.css` clears Tailwind's defaults for color, font, text size, radius, shadow, blur and animation, then defines only the tokens below. Classes such as `bg-white`, `text-gray-500`, `shadow-lg`, `backdrop-blur-md` or `animate-bounce` will not compile. That keeps screens consistent without anyone having to police them. If a screen really needs a new value, that is a library addition: see [Growing the library](rules.md#growing-the-library).

### Color

| Token | Hex | Example classes | Use |
|---|---|---|---|
| `heather` | `#D3D3CF` | `bg-heather` | Page background (the table) |
| `heather-deep` | `#BDBDB8` | `border-heather-deep` | Dividers and dashed empty slots on the page |
| `card` | `#F7F6F1` | `bg-card` | Index card surface |
| `card-edge` | `#E4E3DA` | `bg-card-edge` | First card under a stack, chips, skeleton blocks |
| `card-edge-deep` | `#B9B8AF` | `bg-card-edge-deep` | Second card under a stack |
| `rule` | `#D8D4C8` | `border-rule`, `ruled` | Ruled lines and dashed rules on cards |
| `field` | `#FBFAF6` | `bg-field` | Input fill |
| `ink` | `#1C1C1C` | `text-ink`, `bg-ink`, `border-ink` | Text, borders, header band |
| `ink-raised` | `#2E2E2E` | `hover:bg-ink-raised` | Hover and raised areas on ink |
| `muted` | `#4A4B47` | `text-muted` | Secondary text on heather and on cards |
| `on-ink` | `#F4F1EA` | `text-on-ink` | Text on ink |
| `on-ink-muted` | `#BDBDB8` | `text-on-ink-muted` | Secondary text on ink |
| `red` | `#C8102E` | `bg-red`, `outline-red` | Primary fills, marker underline, selection outline, progress |
| `red-ink` | `#A50D26` | `text-red-ink` | Red text and primary hover |
| `on-red` | `#F7F6F1` | `text-on-red` | Text on red |

Contrast pairs that pass WCAG AA:

- `muted` text: 5.8:1 on `heather`, 8.2:1 on `card`.
- `red` is for fills and marks. Red **text** uses `red-ink` (5.2:1 on heather, 7.2:1 on card). Plain `red` text is 3.9:1 on heather and fails.
- `on-red` on `red`: 5.4:1. `on-ink-muted` on `ink`: 8.9:1.
- The focus ring is `ink` everywhere except on ink surfaces, where components switch to `outline-on-ink`.

### Type: one family, three voices

Recursive, a variable Google font, loaded with its CASL (casual) and MONO axes.

| Voice | Utility | Use for |
|---|---|---|
| Casual | `voice-casual` | People's names, intros, page and card headings, anything written to a person |
| Linear | `voice-linear` (the default) | Interface text: body copy, buttons, labels, forms |
| Mono | `voice-mono` | Small labels, course codes, counts, card headers |

Use one voice per element. `voice-casual` and `voice-mono` overwrite each other.

| Size token | Size / line height | Typical voice and use |
|---|---|---|
| `text-display` | 44px / 1.05 | Casual, extrabold. Page `h1` from `sm` up |
| `text-display-sm` | 34px / 1.08 | Casual, extrabold. Page `h1` on phones (`text-display-sm sm:text-display`) |
| `text-name` | 40px / 1.05 | Casual, extrabold. Classmate name on a card |
| `text-heading` | 24px / 1.2 | Casual, extrabold. Section `h2`, card headings |
| `text-note` | 19px / 1.5 | Casual. Reasons and text on cards |
| `text-lead` | 18px / 1.5 | Linear. Intro paragraphs, inputs |
| `text-base` | 16px / 1.5 | Linear. Default body and buttons |
| `text-small` | 14px / 1.45 | Linear. Hints, meta, footnotes |
| `text-label` | 12px / 1.4 | Mono, semibold, uppercase, `tracking-[0.04em]`. Use `<MonoLabel>` |

### Radii

`rounded-tag` 4px (chips), `rounded-field` 8px (inputs, nav items, notices), `rounded-tile` 10px (sidebar items, small cards), `rounded-card` 14px (index cards), `rounded-full` (buttons, monograms, progress). The mix is deliberate.

### Utilities

| Utility | What it does |
|---|---|
| `voice-casual`, `voice-linear`, `voice-mono` | The three type voices |
| `mark-shared` | Red marker underline. Use the `<Marker>` component |
| `ruled` | Index-card ruling, 2rem line height. Used on the intro side |
| `animate-pulse-soft` | Skeleton and "checking" pulse |

### Depth and motion

- There are no shadow tokens. Depth comes from `CardStack`, used only where a real deck sits underneath.
- Two motions exist: the card flip (500ms ease-out) and the skeleton pulse. Hovers change color only.
- `prefers-reduced-motion` turns both into instant changes; `globals.css` handles this for every element.
- `PastClassCard` is the only tilted element (-1deg).

### Layout

- `Container`: `max-w-7xl` (1280px) with 20px gutters on phones and 32px from `sm`.
- `SidebarLayout`: a ~256px sidebar and a content column that stack on phones without media queries.
- Breakpoints are Tailwind's defaults: `sm` 640px, `md` 768px, `lg` 1024px.
- There is a light theme only. Dark mode would be a library addition.
