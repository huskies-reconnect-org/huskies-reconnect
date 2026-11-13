# Recipes

One recipe per TASKS.md item that has a UI. Each gives the route, what to build it from, the states to handle and the key copy. The recipes are a starting point: if a screen works better another way, change it and say why in the PR. New components follow [Growing the library](rules.md#growing-the-library).

## Routes

| Route | Screen | Task |
|---|---|---|
| `/` | Signed-out landing | Phase 1 skeleton (exists) |
| `/sign-in` | Email sign-in and "Check your inbox" | Phase 1 auth |
| `/auth/callback` | Route handler that finishes the magic link (no UI) | Phase 1 auth |
| `/profile` | Profile form, and first-run onboarding | Phase 2 profile |
| `/courses` | Your courses, plus search and join | Phase 2 courses |
| `/classmates` | Redirects to the first deck, or an empty state | Phase 2 dashboard |
| `/classmates/[course]` | One course's deck, for example `/classmates/cs-3500` | Phase 2 dashboard, Phase 3 intros |
| `/past-classes` | Class networks by term | Phase 3 resurfacing |
| `/past-classes/[course]` | One class network | Phase 3 resurfacing |
| `/ui` | Component reference (developers only, `noindex`) | Exists |

Signed-in pages use `<AppHeader nav={appNav} account={viewer} />`. Signed-out pages use `<AppHeader />`.

## Phase 1: Foundation

### Next.js + Tailwind frontend skeleton

Done: the app in `apps/web`, the tokens, the Recursive font, the component library, the landing page, the custom 404, the favicon and `/ui`. Deploying it belongs to the separate deploy task below.

### .edu email auth flow (Supabase magic link)

**Route:** `/sign-in`. **Build with:** `AppHeader` (no nav), `Container`, `CardStack depth={1}`, `IndexCard`, `TextField`, `Button size="lg"`, `Notice`.

| State | What shows |
|---|---|
| Idle | `h1` "Sign in", the field "Northeastern email" (`type="email"`, `autoComplete="email"`, placeholder `you@northeastern.edu`), button "Email me a sign-in link", footnote "We email you a one-time link, so there is no password to remember." |
| Wrong domain | Field error "Use your @northeastern.edu address. Other emails can't join." Check it on the client before calling Supabase, and again on the server. |
| Sending | Button reads "Sending link" and is disabled. |
| Sent | The form is replaced by `h2` "Check your inbox" and "We sent a sign-in link to {email}. It works once." Quiet buttons: "Use a different email" and, after 30 seconds, "Send it again". |
| Expired or used link | `Notice tone="error"` titled "That sign-in link has expired" with a button "Email me a new link". |
| Error | `Notice tone="error"`: "Couldn't send the link. Check your connection and try again." |

After sign-in, a first-time user goes to `/profile`, then `/courses`. A returning user goes to `/classmates`. Under the form, add: "Only @northeastern.edu addresses can join. Your profile is visible only to people in your courses."

### Deploy the skeleton (Vercel + Render)

No new UI. Before the first public deploy, set `metadataBase` in `layout.tsx` to the production URL and add an `opengraph-image` (see `01-app/03-api-reference/03-file-conventions/01-metadata/` in the bundled Next docs). Keep `/ui` deployed for previews; it is already `noindex`.

## Phase 2: Core features

### Course search + join UI

**Route:** `/courses`. **Build with:** `Container`, `TextField`, `Button`, `CourseList`, `CourseRow`, `EmptyState`, `Notice`, `Dialog`, `Skeleton`. **Reference:** `CourseSearchDemo` on `/ui`.

- `h1` "Courses". Section "Your courses" lists the joined sections, each with a secondary "Leave" that opens a `Dialog` ("Leave CS 3500?", "You stop getting cards for this course, and you won't be in its class network when the term ends. Intros you already sent stay sent.").
- Section "Find a course": a `<form role="search">` with the field "Find a course" and a "Search" button (`size="lg"`). Put the hint "Course code like CS 3500, or the 5-digit CRN from your schedule." under the row.
- Results come back one row per section. Join turns into "Joining", then "Joined", with `Notice tone="success"`: "Joined CS 3500. Cards start once 10 classmates have joined."
- Loading: three `Skeleton` rows inside `CourseList`. No match: `EmptyState` "No course matches {query}" with "Check the code or CRN on your class schedule." Error: `Notice tone="error"`.
- Show "38 classmates here" only when the API returns the count.

### Student profile form (interests, major, goals)

**Route:** `/profile`. **Build with:** `IndexCard as="form"`, `SelectField`, `ChipToggle` in a `fieldset`, `TextAreaField`, `Button`, `Notice`. **Reference:** `FormDemo` on `/ui`.

- Fields: Major (`SelectField`), Year (`SelectField`, hint "Used to suggest people at a similar point in school."), Interests (`ChipToggle` group, at least 3, hint "Pick a few. Classmates only see the ones you share."), Goals this year (`TextAreaField`, 280 characters max).
- Privacy line above the save button: "Classmates in your courses see your name, major and year, plus only the interests and goals you share with them."
- Save: "Save profile" (primary), with `Notice tone="success"` "Profile saved" and "Next week's cards will use these answers." First run: the button reads "Save and add courses" and goes to `/courses`.
- Errors sit on each field: "Pick at least 3 interests."
- Saving should not wait for embeddings to be generated.

### Embedding generation (Gemini API) + store in pgvector

No UI. The profile save returns as soon as the profile is stored; embeddings run afterwards.

### Matching query (cosine similarity, top-k classmates)

No UI, but the UI depends on its output. Return reasons as `{ text, highlight }` pairs (see `ClassmateCard` in [components.md](components.md#classmatecard)): two or three full sentences written to the viewer, each with the exact shared phrase. Do not send similarity scores to the client.

### Basic dashboard showing matched classmates (no AI message yet)

**Routes:** `/classmates`, `/classmates/[course]`. **Build with:** `SidebarLayout`, `DeckLink`, `DeckWaiting`, `PastClassCard`, `MonoLabel`, `ProgressPips`, `CardStack`, `ClassmateCard`, `DeckActions`, `EmptyState`, `ClassmateCardSkeleton`. **Reference:** the Dashboard section on `/ui`.

- Sidebar: "Your decks · Fall 2026" with one `DeckLink` per course that has cards, a `DeckWaiting` for each course below the threshold, a link to `/courses` to add one, and "Past classes" with any `PastClassCard`s.
- Main: a `MonoLabel` ("Deck · CS 3500 Object-Oriented Design"), `h1` "{n} classmates worth meeting", "New cards every Monday.", `ProgressPips`, then the top card in a `CardStack` with `depth` set from the cards left.
- Until Phase 3, render `DeckActions side="front"` with only `onSkip`. Leaving out `onFlip` hides Show intro.

| State | What shows |
|---|---|
| Loading | `ClassmateCardSkeleton` inside `CardStack` |
| No courses | `EmptyState` "No courses yet" with `ButtonLink` "Add a course" |
| Course below threshold | `EmptyState` "Cards start at 10 classmates", "{joined} have joined so far. Share the course with people in your section." |
| Deck finished | `EmptyState` "You're through this week's deck", "New cards arrive Monday." |
| Error | `Notice tone="error"`: "Couldn't load your deck. Refresh to try again." |

## Phase 3: AI / agentic layer

### LangGraph pipeline wiring

No UI. Each draft the UI receives needs `{ body, safety: "checking" | "passed" | "held", reason? }`, where `reason` is a sentence a student can act on.

### Icebreaker generation (Gemini)

**Build with:** `FlipCard` inside `CardStack`, `ClassmateCard` (front), `IntroCard` (back), `DeckActions` with `onFlip`. **Reference:** `DeckDemo.tsx`.

- Show intro flips the card. Edit intro switches `IntroCard` to `editing`, and Done editing sends the new text back through the safety check (`safety` returns to `"checking"`).
- While a draft is still being written there is no body yet. Show the back with `safety="checking"` and two or three `Skeleton` lines in place of the text. (A dedicated `IntroCardSkeleton` would be a reasonable library addition.)
- Drafts follow the intro guidance in [copy.md](copy.md#patterns): under 60 words, first name, one concrete shared thing, one easy question.

### Safety/moderation filter before sending

- `passed`: Send is enabled.
- `checking`: Send is disabled and the status pulses.
- `held`: Send is disabled and `IntroCard` shows the reason with "Edit it, or write your own." Example reasons: "It includes a phone number. Share contact details after they reply." "It comments on how someone looks. Keep intros about what you share."
- Never show a draft the filter has not run on as sendable, and never send without the button.

### Feedback tracking (accepted/ignored matches)

- Send intro records `accepted`; Not now records `ignored` and moves the card to the back. "Back to {name}" records nothing.
- Users never see the words "accepted" or "ignored". After a send, show `Notice tone="success"`: "Intro sent. {First name} gets it now. Replies show up in Classmates."
- An Undo for Not now would need a toast, which is a library addition.

### Resurfacing scheduler (semester-end trigger)

- **Dashboard:** `PastClassCard` in the sidebar when a past class has something timely, written as one specific sentence with a `Marker`, for example: "Three people from your lab start <Marker>Seattle co-ops</Marker> in January, same as you."
- **`/past-classes`:** `h1` "Past classes", grouped by term (`MonoLabel as="h2"` "Spring 2026"), one row per class network.
- **`/past-classes/[course]`:** `h1` "CS 2510 class network", a line on when it opened ("Opened when Spring 2026 ended."), and the members. There is no member row in the library yet; propose one through Growing the library, using `CourseRow`'s layout as the starting point.
- Copy for the term-end moment: "Your Fall 2026 courses are now class networks. You'll hear from them when something comes up that matters to you."

## Phase 4: Polish and demo prep

### UI polish + responsive design

Go through the [PR checklist](rules.md#pr-checklist) on every route at 360, 390, 768 and 1280px wide. Do one pass with only the keyboard and one with reduced motion turned on.

### End-to-end testing

UI cases worth covering:
- Sign-in rejects a non-Northeastern email and accepts a Northeastern one.
- Deck: Not now cycles the card to the back; Show intro flips it; the hidden face cannot be reached by Tab.
- A held intro cannot be sent; editing it sends it back to checking.
- Joining a course updates "Your courses", and leaving asks for confirmation.
- Unknown routes show the custom 404.

### Bug fixes from testing

Fix bugs with existing components where you can. If a fix needs a new component or variant, follow Growing the library.

### README + architecture diagram

Docs and diagrams are not UI copy, so the UI copy rules do not bind them. To match the product, you can use the palette from [README.md](README.md#color) in diagrams.

### Demo script + slides

Demo with seeded test accounts on staging, not with the `/ui` example data. `/ui` makes a good slide on the design system.
