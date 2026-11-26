# Demo script: NU Launch Labs showcase, Dec 5

About **4 minutes** of clicking and talking. For a 2-minute slot, skip steps 3 and 7.
Live site: https://huskies-reconnect.vercel.app

## Before you present (T-10 min)

1. Run the go / no-go check. It wakes the Render API (free tier sleeps after ~15 idle minutes):
   ```bash
   cd apps/api && source .venv/bin/activate
   python scripts/predemo_check.py --presenter <your NU email>
   ```
   Fix anything marked FAIL (each line says how), then rerun until it says **GO**.
2. **Sign in ahead of time** in the browser you'll present from. Don't depend on a login email arriving on stage.
3. Open two tabs: **Home** (signed in) and **/login** (to show the NU-only rule).
4. Your profile should already mention specific AI/ML interests, and you should already be in **CS5100**, so matches appear (the check verifies both).
5. Budget: Gemini's free tier allows **15 AI calls per minute for the whole app**. Plan on 3–4 "Draft intro" clicks total, and don't spam Regenerate.

## The flow

| # | Click | Say (short version) |
|---|---|---|
| 1 | *(no click)* | "Canvas shows you exactly who's in your class. When the semester ends, that's gone. Huskies Reconnect keeps those connections, and brings them back when they matter." |
| 2 | **/login tab**: type a `@gmail.com` address → Send code | "Only Northeastern students get in. This is checked on the server too, by a Supabase signup hook, not just here." Switch to the signed-in tab. |
| 3 | **Edit profile** | "You describe your interests and goals. We turn that into an embedding with Gemini, a vector that captures meaning, so 'NLP' and 'language models' land close together." |
| 4 | **Your courses** → **CS5100 → See classmates** | "Here are classmates ranked by how much you actually have in common." |
| 5 | Point at the **Strong / Good / Possible** labels and a **Demo profile** tag | "Only people above a relevance bar show up. We tuned it on real embeddings, so unrelated profiles don't appear as 80% matches. These are seeded demo students, and they're labeled honestly." |
| 6 | **Draft intro** on the top match | "If you're not sure what to say, it drafts a short intro based on what you share. Every draft passes three safety layers before you see it: Gemini's filters, profiles treated as data so nobody can inject instructions, and our own check that blocks links, contact info and profanity." Click **Copy**. |
| 7 | **Simulate semester end** (dashed "Demo controls" box) | "Normally the class disappears now. Here it becomes an alumni group: same classmates, and the intro switches to a reconnecting message." Click **Draft intro** once to show the catch-up tone. |
| 8 | *(no click)* | "Sign in, join, match, reconnect, all live on Vercel, Render, Supabase and Gemini." |

**Right after the demo:** press **Undo semester end** so CS5100 is back to normal for the next person.

## If something goes wrong

| What you see | Do this |
|---|---|
| Pages load but data spins for ~50 s | Render was asleep. Say "free-tier server waking up" and keep talking; it recovers. (The pre-check prevents this if it ran within 15 minutes.) |
| "The AI is busy right now. Try again in N seconds." | That's the rate limit working as designed. Say so ("we hit Gemini's free-tier limit, and the app tells you exactly when to retry"), then move on to step 7 or retry after the wait. |
| "We couldn't draft an intro that passed our safety check" | Click **Try again** once. This is the safety layer refusing a draft, which is itself worth pointing out. |
| No classmates under CS5100 | Your profile is too vague or you're not in the course. Edit the profile with specific interests (NLP, LLMs, robotics…) and save. |
| Signed out unexpectedly | Use the pre-opened signed-in browser profile; don't wait for an email on stage. |
| Vercel itself is down | Run locally (`npm run dev` in `apps/web`, `uvicorn` in `apps/api`) at http://localhost:3000. |

## Likely questions

- **How is matching done?** Gemini embeddings of interests and goals (768 dimensions) in Postgres with pgvector, cosine similarity within the course, and a relevance bar of 0.82.
- **What stops spam or abuse?** NU-only sign-in, a per-user limit of 10 AI drafts per 10 minutes, safety checks on every draft, and the student copies and sends the message themselves; nothing is sent automatically.
- **Is my data shared?** Classmates see your name, major, interests and goals, never your email.
- **What happens at semester end?** The course becomes an alumni group; former classmates still see each other and intros switch to reconnecting. (A scheduler would do this automatically; the demo uses a button.)
