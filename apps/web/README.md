# apps/web

Next.js (App Router) + TypeScript + Tailwind frontend.

```bash
cp ../../.env.example .env.local   # fill in the NEXT_PUBLIC_* values
npm install
npm run dev                        # http://localhost:3000
```

- `/login`: minimal @northeastern.edu sign-in with a 6-digit email code (to be restyled by the frontend team)
- `/`: placeholder home that shows the session and calls the API's `/me`
- `lib/supabase.ts`: browser Supabase client, typed from `schema/types/database.types.ts` (imported as `@schema/...`)
