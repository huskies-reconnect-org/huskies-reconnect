# apps/web

Next.js (App Router) + TypeScript + Tailwind frontend.

```bash
cp ../../.env.example .env.local   # fill in the NEXT_PUBLIC_* values
npm install
npm run dev                        # http://localhost:3000
```

- `/login`: @northeastern.edu sign-in with a 6-digit email code
- `/`: home with links to profile and courses
- `/profile`: major, interests, goals (used for matching)
- `/courses`: join courses; `/courses/[id]`: ranked classmates, Draft intro, alumni view
- `lib/supabase.ts`: browser Supabase client, typed from `schema/types/database.types.ts` (imported as `@schema/...`)
