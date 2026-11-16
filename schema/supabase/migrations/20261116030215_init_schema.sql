-- Phase 1 schema: users, courses, course_members.
-- Embedding / profile-vector columns come in Phase 2.

create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- users: one row per auth.users row, created by trigger on signup
-- ---------------------------------------------------------------------------
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text,
  major       text,
  grad_year   smallint check (grad_year between 2000 and 2100),
  created_at  timestamptz not null default now(),
  -- Second line of defense; the before-user-created auth hook (Step 3) is the primary gate.
  constraint users_email_northeastern check (lower(email) like '%@northeastern.edu')
);

-- ---------------------------------------------------------------------------
-- courses: one row per course offering (code + term + section)
-- ---------------------------------------------------------------------------
create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  code        text not null check (code ~ '^[A-Z]{2,5}[0-9]{4}$'),            -- e.g. CS5100
  title       text not null,
  term        text not null check (term ~ '^[0-9]{4}(FA|SP|SU1|SU2)$'),        -- e.g. 2026FA
  section     text,
  ends_on     date not null,  -- drives the semester-end resurfacing trigger (Phase 3)
  created_at  timestamptz not null default now(),
  constraint courses_offering_unique unique nulls not distinct (code, term, section)
);

-- ---------------------------------------------------------------------------
-- course_members: who is (or was) in which course
-- ---------------------------------------------------------------------------
create table public.course_members (
  user_id     uuid not null references public.users (id) on delete cascade,
  course_id   uuid not null references public.courses (id) on delete cascade,
  status      text not null default 'active' check (status in ('active', 'alumni')),
  joined_at   timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- PK covers lookups by user_id; this covers "everyone in course X".
create index course_members_course_id_idx on public.course_members (course_id);

-- ---------------------------------------------------------------------------
-- Signup trigger: mirror new auth users into public.users
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-level security
-- The browser uses the public anon key, so these policies are what protect data.
-- FastAPI connects as the postgres role and bypasses RLS; it does its own checks.
-- Writes to courses / course_members go through the API only (no write policies).
-- ---------------------------------------------------------------------------
alter table public.users          enable row level security;
alter table public.courses        enable row level security;
alter table public.course_members enable row level security;

-- Helper: is the current user a member of this course?
-- security definer so policies on course_members can call it without recursing.
create function public.is_course_member(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.course_members
    where course_id = p_course_id and user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_course_member(uuid) from public, anon;
grant  execute on function public.is_course_member(uuid) to authenticated;

-- users: read your own row, plus classmates who share a course with you
create policy "users: read self"
  on public.users for select to authenticated
  using (id = (select auth.uid()));

create policy "users: read classmates"
  on public.users for select to authenticated
  using (exists (
    select 1 from public.course_members cm
    where cm.user_id = users.id and public.is_course_member(cm.course_id)
  ));

-- users: update your own profile fields only (not id / email / created_at)
create policy "users: update self"
  on public.users for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.users from authenticated;
grant  update (full_name, major, grad_year) on public.users to authenticated;

-- courses: any logged-in student can browse
create policy "courses: read all"
  on public.courses for select to authenticated
  using (true);

-- course_members: see memberships of courses you're in (includes your own)
create policy "course_members: read own courses"
  on public.course_members for select to authenticated
  using (public.is_course_member(course_id));
