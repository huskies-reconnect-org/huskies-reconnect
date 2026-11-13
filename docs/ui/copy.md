# Copy

Words are part of the interface. They should make the next step obvious, sound like a person, and never oversell.

## Voice

- **Plain and specific.** "Three people from your lab start Seattle co-ops in January, same as you." beats "Exciting opportunities await!"
- **Written to one student.** Use "you" and the classmate's first name. Use full names only in headings and lists.
- **Calm.** No exclamation marks, no hype, no guilt ("Don't miss out").
- **Sentence case everywhere**, including buttons and headings.

## The product's words

Use these words consistently, so people learn their way around.

| Say | For | Not |
|---|---|---|
| classmates | People in your courses | connections, matches, network, users |
| course | A class you joined (CS 3500, one section) | class (except in "class network"), group |
| deck | The week's suggestions for one course | feed, list, recommendations |
| card | One classmate in a deck | profile, match |
| in common | The reasons on a card | compatibility, score, match % |
| intro | The message you send to a classmate | icebreaker, DM, message (except in notices) |
| Not now | Skipping a card | Reject, Pass, Dismiss |
| Send intro / Intro sent | Sending, and its confirmation | Submit, Connect |
| Checked for tone and privacy | A draft that passed the safety check | Safe, Approved by AI, Moderated |
| Held back | A draft the safety check stopped | Flagged, Blocked, Violation |
| class network | A course after the term ends | alumni group, archive |
| Past classes | Where class networks live | History, Archive |

"Icebreaker" is fine in code and in TASKS.md, but users see "intro".

## Patterns

**Buttons** are verbs that say what happens, and the result repeats the verb.

| Button | Result |
|---|---|
| Send intro | Intro sent |
| Join | Joined |
| Save profile | Profile saved |
| Email me a sign-in link | Check your inbox |
| Leave course | Left CS 3500 |

**Errors** say what happened and how to fix it, in the interface's voice. They never apologize and are never vague.

- "Use your @northeastern.edu address. Other emails can't join."
- "That sign-in link has expired. We can email you a new one."
- "Couldn't join CS 3500. The course list didn't load. Check your connection and try again."

**Empty states** say what will appear and how to get it.

- "No courses yet. Join the courses you're taking and your first deck shows up the next Monday."
- "You're through this week's deck. New cards arrive Monday."

**AI disclosure** is plain and truthful.

- "We drafted this from what you both shared."
- "Checked for tone and privacy."
- Held: "This intro won't send as written. It includes a phone number. Share contact details after they reply. Edit it, or write your own."

**Drafted intros** should read like a student wrote them: short (under 60 words), first name, a concrete shared thing, and one easy question. No flattery, no "I hope this finds you well", no emojis.

## Formats

| Thing | Format | Example |
|---|---|---|
| Course | Subject, space, number | CS 3500 |
| Course with name | Code, then the title | CS 3500 Object-Oriented Design |
| Term | Season and year | Fall 2026 |
| Date | Short month and day, year only if needed | Nov 13, Dec 12, 2026 |
| Time | 12-hour, lowercase pm only if ambiguous | 9:50, 6:00 pm |
| Year in school | Ordinal | 3rd year |
| Program | Major, middle dot, year | Data Science · 2nd year |
| Counts | Digits, singular when 1 | 1 card, 4 cards |
| Separator | Middle dot with spaces | CS 3500 · Tuesday lab |

## Avoid in UI text

- Em dashes. Use a period, a comma, or a middle dot as a separator.
- Emojis and decorative symbols.
- "It's not X, it's Y" and "not just X, but Y" constructions.
- Hype words: seamless, effortless, unlock, supercharge, revolutionize, magic, AI-powered, smart (as a selling word), game-changer, journey, delve.
- Filler openers ("Welcome to your dashboard!") and closers ("Happy connecting!").
- Groups of three adjectives or features added for rhythm.
- Exclamation marks.
- Vague errors ("Something went wrong").

## Before you merge

Read every string you added aloud once. If your agent has a humanizer skill (in Claude Code, `/humanizer`), run new UI copy through it and keep any rewrite that still says the same thing.
