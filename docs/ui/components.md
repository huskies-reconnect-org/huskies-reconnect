# Components

Every component lives in `apps/web/src/components/ui/` and is exported from `@/components/ui`. Run the app and open `/ui` to see each one in its states. The `/ui` page source (`apps/web/src/app/ui/`) doubles as working examples of how the pieces fit together.

```tsx
import { Button, ClassmateCard, IntroCard } from "@/components/ui";
```

`className` on a component is for layout (margin, width, flex or grid placement). To restyle a component, change the component itself, or add a variant through [Growing the library](rules.md#growing-the-library).

Components marked **client** use hooks or browser APIs and carry `"use client"`. The rest work in server components unless you pass them event handlers, in which case the parent must be a client component.

## Inventory

| Component | File | Use it for |
|---|---|---|
| `Button`, `ButtonLink`, `buttonClasses` | Button.tsx | Actions (`Button`) and navigation that looks like a button (`ButtonLink`) |
| `TextField`, `TextAreaField`, `SelectField` (client) | Field.tsx | Labelled form fields with a hint and an error |
| `ChipToggle`, `Chip` | Chip.tsx | Picking several options (interests); static tags on cards |
| `MonoLabel`, `CourseCode`, `Marker`, `Wordmark` | Text.tsx | Small labels, course codes, the shared-thing underline, the product name |
| `Monogram`, `initialsFrom` | Monogram.tsx | The only avatar: initials in a circle |
| `IndexCard`, `CardStack` | IndexCard.tsx | The card surface, and the stacked deck look |
| `FlipCard` (client) | FlipCard.tsx | One card with a front and a back |
| `ClassmateCard`, `ReasonText` | ClassmateCard.tsx | Front of a classmate card |
| `IntroCard` | IntroCard.tsx | Back of a classmate card: the intro draft |
| `SafetyStatus` | SafetyStatus.tsx | Where a draft is in the safety check |
| `DeckActions` | DeckActions.tsx | Not now, Show intro, Edit intro, Send intro |
| `ProgressPips`, `Meter` | Progress.tsx | "Card 2 of 4"; a bar for a real quantity |
| `DeckLink`, `DeckWaiting` | DeckNav.tsx | Course decks in the sidebar; a course waiting for classmates |
| `PastClassCard` | PastClassCard.tsx | A past class coming back as a class network |
| `CourseList`, `CourseRow` | CourseRow.tsx | Course search results with Join |
| `AppHeader`, `appNav` (client) | AppHeader.tsx | The ink header band and main navigation |
| `Container`, `SidebarLayout`, `SiteFooter` | Layout.tsx | Page width, sidebar layout, footer |
| `Notice` | Notice.tsx | Inline success, info and error messages |
| `EmptyState` | EmptyState.tsx | An empty slot that points to the next step |
| `Skeleton`, `ClassmateCardSkeleton` | Skeleton.tsx | Loading placeholders shaped like the content |
| `Dialog` (client) | Dialog.tsx | The one modal shell, for confirmations |

## Actions

### Button and ButtonLink

Variants: `primary` (red, one per view), `secondary` (ink outline), `quiet` (underlined text, for backing out), `inverse` (on ink surfaces). Sizes: `md` (44px) and `lg` (48px, the same height as a field).

```tsx
<Button onClick={send}>Send intro</Button>
<Button variant="secondary" onClick={edit}>Edit intro</Button>
<Button variant="quiet" onClick={cancel}>Cancel</Button>
<ButtonLink href="/courses" variant="secondary">Add a course</ButtonLink>
```

- Label a button with the verb that happens. The confirmation repeats it ("Send intro", then "Intro sent").
- Use `ButtonLink` for navigation and `Button` for actions. Do not put a `<button>` inside a link.
- `buttonClasses(variant, size)` gives you the classes for the rare element that must look like a button (a `<label>` for a file input, for example).

## Forms

### TextField, TextAreaField, SelectField (client)

Every field has a visible `label`, an optional `hint`, and an optional `error`. Setting `error` also sets `aria-invalid` and links the message with `aria-describedby`. Fields are 48px tall with a 2px ink border.

```tsx
<TextField
  label="Northeastern email"
  type="email"
  autoComplete="email"
  placeholder="you@northeastern.edu"
  error={emailError}
/>
<SelectField label="Year" defaultValue="3">
  <option value="3">3rd year</option>
</SelectField>
<TextAreaField label="Goals this year" hint="A sentence or two." rows={3} />
```

- The placeholder shows an example. It never replaces the label.
- Errors say how to fix the problem: "Use your @northeastern.edu address. Other emails can't join."
- To put a field and a button on one row, use `flex items-end gap-3` with a `size="lg"` button. Put any hint below the row and link it with `aria-describedby` (see `CourseSearchDemo`).

### ChipToggle and Chip

`ChipToggle` is a checkbox styled as a pill; checked means a filled ink pill. Wrap a group in `<fieldset>` with a `<legend>`. `Chip` is a static, non-interactive tag for use on cards.

```tsx
<fieldset>
  <legend className="font-bold">Interests</legend>
  <ChipToggle name="interests" value="Rock climbing">Rock climbing</ChipToggle>
</fieldset>
```

## Text and people

- `MonoLabel` is the small uppercase mono label. Pass `as="h2"` and an `id` when it is a section heading. A label labels: never put the only copy of important information in one.
- `CourseCode` renders "CS 3500" in mono and never wraps between subject and number.
- `Marker` is the red marker underline. Mark only the shared phrase: `applying for <Marker>product design co-ops</Marker> this spring`.
- `Wordmark` is the product name and links home. Use `tone="on-ink"` on the header.
- `Monogram` shows initials from a name. Sizes `sm` (32px), `md` (40px), `lg` (54px). Tones: `ink` (classmates), `card` (on the ink header), `red` (the signed-in person only). It is `aria-hidden` unless you pass `label`, because a visible name usually sits next to it.

## Cards and the deck

### IndexCard and CardStack

`IndexCard` is the cream surface (14px radius, no border, no shadow). `CardStack` puts up to two offset cards underneath. Set `depth` from the real number of cards left (`2`, `1` or `0`); never show a stack over a single item.

```tsx
<CardStack depth={remaining >= 2 ? 2 : remaining}>
  <IndexCard>…</IndexCard>
</CardStack>
```

### ClassmateCard

The front of a card. `reasons` is a list of two or three `{ text, highlight }` pairs. `text` is a full sentence written to the viewer, and `highlight` is the exact shared phrase inside it, which gets the marker. If `highlight` is not found in `text`, the sentence renders without a marker.

```tsx
<ClassmateCard
  name="…"
  program="Computer Science and Design · 3rd year"
  courseCode="CS 3500"
  context="Tuesday lab"
  reasons={[{ text: "You're in the same Tuesday lab.", highlight: "Tuesday lab" }]}
/>
```

API note for the matching task: return reasons in this shape so the UI never has to parse free text.

### IntroCard

The back of a card. It shows the drafted intro on ruled lines, the `SafetyStatus`, and the footnote "We drafted this from what you both shared. Maya sees it only after you send it." Props:

- `safety`: `"checking" | "passed" | "held"`. With `"held"`, also pass `safetyReason`, a plain sentence ("It includes a phone number. Share contact details after they reply."). The card adds an error `Notice`.
- `editing` and `onBodyChange` turn the body into a `TextAreaField`. These need a client parent.
- `drafted={false}` for an intro the person wrote from scratch. This drops the "We drafted this" sentence.

### FlipCard (client)

Controlled by `flipped`. The hidden face is `inert`, so keyboard and screen reader users only reach the face that is showing. Its height is the taller of the two faces. Put it inside `CardStack` when it is part of a deck.

```tsx
<CardStack depth={2}>
  <FlipCard flipped={flipped} front={<ClassmateCard … />} back={<IntroCard … />} />
</CardStack>
```

### DeckActions

The row under the card. On the front it shows Not now and Show intro; on the back, Not now, Edit intro, Send intro and "Back to Maya".

- `onSkip` records "ignored" feedback and moves the card to the back. `onSend` records "accepted" and sends.
- `canSend` must be `true` only when the safety state is `"passed"`. Send is also disabled while `editing` or `sending`.
- Leave out `onFlip` while there is no intro side (the Phase 2 dashboard). The flip buttons then disappear.

The full wiring is in `apps/web/src/app/ui/_components/DeckDemo.tsx`; copy that and swap its local state for API calls.

### SafetyStatus

A short mono status ("Checking tone and privacy", "Checked for tone and privacy", "Held back") with `role="status"`. `IntroCard` already includes it; use it on its own only for a draft shown outside a card.

### ProgressPips and Meter

`ProgressPips current={2} total={4}` shows "Card 2 of 4" plus decorative pips. `Meter` is a thin bar for a real quantity with an accessible label. Show the same fact as visible text next to it.

## Navigation and lists

- `DeckLink` is one course deck in the sidebar (code, title, count). The current deck gets a red outline and `aria-current="page"`.
- `DeckWaiting` is a course below the threshold: "Cards start at 10 classmates. 6 have joined." with a `Meter`.
- `PastClassCard` is a past class resurfacing. Its children are one sentence with the shared thing in a `Marker`, followed by a link.
- `CourseList` and `CourseRow` are search results. Each row is one section with its own Join; `joined` replaces the button with "Joined". Pass `members` only when the number is real.

## Page structure

- `AppHeader` is the ink band. Signed-in pages pass `nav={appNav}` and `account={{ name, href: "/profile" }}`. Signed-out pages pass nothing and get the wordmark only. The current item is worked out from the path.
- `Container` sets the page width and gutters.
- `SidebarLayout` takes `sidebar`, `sidebarLabel` and children. It renders an `<aside>` and a content column; the page supplies `<main>`.
- `SiteFooter` takes `links`. Link only to pages that exist.

```tsx
<>
  <AppHeader nav={appNav} account={viewer} />
  <main id="main" className="flex-auto">
    <Container className="py-10">
      <SidebarLayout sidebarLabel="Your decks" sidebar={…}>…</SidebarLayout>
    </Container>
  </main>
  <SiteFooter />
</>
```

## Feedback and loading

- `Notice` has tones `info`, `success` and `error`. Errors use `role="alert"`; the others use `role="status"`. Give it a short `title` and one or two sentences. No icons.
- `EmptyState` is a dashed slot with a heading, a sentence about what will appear and how, and one `action`.
- `Skeleton` is a pulsing block; size it like the content it stands in for. `ClassmateCardSkeleton` is ready-made for the deck.
- `Dialog` (client) is a native `<dialog>`: Escape and focus trapping come from the browser, and the scrim is solid ink at 60%. Use it for confirmations. Put buttons in `actions` with the quiet Cancel first and the primary action last.
