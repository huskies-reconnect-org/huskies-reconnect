# UI rules

There are two kinds of rules here.

- **Must** rules protect the people using the app: trust, privacy, honest content and accessibility. Keep them. If one seems wrong for your case, raise it with the lead before working around it.
- **Defaults** describe the look and feel. Follow them unless breaking one makes the screen better, and when you do, say which one and why in the PR. The library is not frozen; see [Growing the library](#growing-the-library).

## Must

### Trust and AI

- Nothing sends until the person presses **Send intro**. No auto-send, no "send all", no sending on a timer.
- Every AI draft passes the safety check before it can be sent. Show `SafetyStatus` on every draft. Keep Send disabled while the state is `checking` or `held`.
- Every draft is editable, and an edited draft is checked again before it can be sent.
- **Not now** is available on every card.
- Suggestions show their reasons as plain sentences. No match scores, percentages, rankings or "compatibility" labels.
- Say plainly when the AI wrote something ("We drafted this from what you both shared"). No sparkle icons and no "magic" or "AI-powered" language.
- Never suggest a classmate did something they did not (no invented "Maya viewed your profile").

### Privacy

- On a classmate card, show name, major, year, shared course context, and the things the two people share. Nothing else: no email, no full profile, nothing they did not share with that course.
- Visibility copy must be accurate: profiles are visible only to people in your courses.
- Contact details do not go inside drafts. The safety check holds drafts that contain them.

### Honest content

- No fake data in product routes: no sample people, made-up counts, testimonials or placeholder text. When a number is unknown, leave it out.
- Example data lives only in `apps/web/src/app/ui/_data.ts`, and only `/ui` imports it.
- Avatars are `Monogram`s. Photos appear only if the person uploaded them. No stock or generated faces.

### Accessibility

- Use real elements: `<button>` (or `Button`) for actions, `<Link>`/`<a>` for navigation, `<input>` with a `<label>`. Never put `onClick` on a `div` or `span`.
- Every field has a visible label. A placeholder is an example, never the label.
- Text contrast is at least 4.5:1, or 3:1 at 24px and up. Use the token pairs in [README.md](README.md#color). Red text uses `red-ink`.
- Everything works with a keyboard and shows a focus ring. The hidden face of a `FlipCard` is `inert`; keep it that way.
- Touch targets are at least 44px.
- Each page has one `<h1>`, and headings go down in order.
- Status changes are announced. Use `Notice` and `SafetyStatus`, which have the right roles, instead of silently swapping text.
- Reduced motion is respected. `globals.css` handles CSS motion; do not add JavaScript animation that ignores it.
- Pages work at 360px wide with no horizontal scrolling.

## Defaults

### Color and surfaces

- Use theme tokens only: heather table, cream cards, ink text, and red for the primary action, selection, progress and the marker.
- One red primary button per view.
- No gradients (the `ruled` and `mark-shared` utilities are the only gradient-built shapes), no glass or blur, no shadows, no neon, no pastels, no purple.
- No colored stripe along the edge of a card. Show selection with an outline (`DeckLink`) or a fill (`ChipToggle`).

### Type and copy

- Recursive only, in its three voices. No Inter, Geist, Space Grotesk or a second family.
- No em dashes, emojis, or "It's not X, it's Y" lines in UI text. The full guide is [copy.md](copy.md).

### Layout and components

- Build from the library first, and compose before you invent.
- No three feature cards in a row, no bento grids, no checkmark bullet lists, no terminal-window mockups, no icons floating next to text.
- Keep radii mixed: pills for buttons, 14px cards, 8px fields, 4px tags.
- On the dashboard, people come as a deck, one card at a time. Elsewhere (search results, class network members) use rows.
- Use `CardStack` only where more cards really exist. `PastClassCard` is the only tilted element.

### Decoration and motion

- No glows, orbs, dot grids, sparkles, animated arrows, parallax or confetti.
- The flip is the signature motion. Hovers change color only.

### Pages

- Every page has `AppHeader` at the top, one `<main id="main">`, and `SiteFooter`.
- Unknown routes use `not-found.tsx`. Call `notFound()` for records that do not exist.
- Set titles with `metadata`. The layout's template renders "Page name | Huskies Reconnect". Never put "Next.js", "React" or "Vite" in a title.
- Loading uses skeletons shaped like the content. Empty space uses `EmptyState` with the next step. Errors use `Notice tone="error"` and say what happened and how to fix it.

## Growing the library

The library covers what TASKS.md needs today, but you will hit screens it does not cover well. Adding to it is welcome whenever the addition makes the UI better. That could be a new component (tabs, a toast with Undo, a class network member row), a variant (a compact button), or a token (a new state color, dark mode).

### For agents

1. **Check first.** Search `src/components/ui/` and the `/ui` page. If existing pieces combine to do the job, use them.
2. **Ask.** Tell the person you are working with what you want to add, why the existing pieces fall short, and where it will be used. Do not add it on your own.
3. **Show a mockup before you build it into a feature.** A quick HTML or image mockup works, or a draft section on `/ui` showing the new piece in its states (default, focus, disabled, plus loading or error if it has them) next to existing components. Share screenshots in the conversation or the PR.
4. **Wait for a yes**, and adjust if they want changes.
5. **Add it properly, in the same PR:**
   - The component in `src/components/ui/`, exported from `index.ts`.
   - A section or demo on `/ui`.
   - An entry in [components.md](components.md). New tokens also go in [README.md](README.md#tokens) and `globals.css`. Update [recipes.md](recipes.md) if a feature should use it.
   - It meets every Must rule above.
6. **Note it in the PR** under a "Library changes" heading, with the mockup.

### For teammates

The process is the same but lighter: open a PR or issue with a screenshot and a sentence on why. Defaults can change by agreement, and that is how the library should grow. A change that touches every screen, such as a new color or font, should go past the lead first.

## PR checklist

Paste this into UI pull requests.

```markdown
- [ ] Built from `@/components/ui`. Any new piece followed "Growing the library" (mockup shown, approved, added to /ui and components.md)
- [ ] One h1, headings in order, one red primary action per view
- [ ] Loading, empty and error states exist
- [ ] Works by keyboard with a visible focus ring; the hidden FlipCard face is not reachable
- [ ] At 360px wide: no horizontal scroll, touch targets at least 44px
- [ ] Copy follows docs/ui/copy.md
- [ ] No sample data or invented numbers in product routes
- [ ] AI drafts: SafetyStatus shown, Send disabled unless passed, Not now available
- [ ] `npm run lint`, `npx tsc --noEmit` and `npm run build` pass
- [ ] Desktop and phone screenshots attached
- [ ] Defaults broken, if any, and why:
```
