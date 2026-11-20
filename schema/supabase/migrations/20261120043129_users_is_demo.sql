-- Seeded demo classmates (apps/api/scripts/seed_demo.py) are flagged so the UI
-- can label them and they can be removed in one statement after the showcase.
alter table public.users add column is_demo boolean not null default false;
