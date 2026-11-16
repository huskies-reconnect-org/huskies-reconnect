# schema/

Database schema for Huskies Reconnect (Supabase Postgres + pgvector).

- `supabase/migrations/`: SQL migrations, applied in timestamp order. Never change the schema in the dashboard; add a migration.
- `types/database.types.ts`: generated TypeScript types. Don't edit by hand.

```bash
cd schema
supabase link --project-ref qoedwsbyrlvcculprxgt    # once per machine
supabase migration new <name>                       # create a migration
supabase db push --remote                           # apply to the shared project
supabase gen types typescript --remote --schema public > types/database.types.ts
```
