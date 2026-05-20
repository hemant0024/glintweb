-- Glint waitlist table
-- Run this once in Supabase SQL Editor (project qtkzacjyuasglgknxghg).
-- Safe to re-run: all statements are idempotent.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'landing_cta',
  user_agent text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_unique
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "anon can insert waitlist" on public.waitlist;
create policy "anon can insert waitlist"
  on public.waitlist
  for insert
  to anon
  with check (
    char_length(email) between 3 and 320
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- No select policy = nobody reads via the anon key.
-- Read the list from the Supabase dashboard (service role bypasses RLS).
