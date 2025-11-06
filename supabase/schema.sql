-- Supabase schema for Simple Notes App
-- Creates a notes table and an updated_at trigger
-- Safe to run multiple times (idempotent for core objects)

-- Ensure pgcrypto for gen_random_uuid (if not available, Supabase may already provide)
create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.notes;
create trigger set_updated_at before update on public.notes
for each row execute procedure public.set_updated_at();

-- Optional: Row Level Security (RLS) demo policies for public read/write without auth.
-- WARNING: These policies are for demo/dev only. Do not use in production as-is.
-- uncomment to apply:
-- alter table public.notes enable row level security;
-- drop policy if exists "Allow read" on public.notes;
-- create policy "Allow read" on public.notes for select using (true);
-- drop policy if exists "Allow insert" on public.notes;
-- create policy "Allow insert" on public.notes for insert with check (true);
-- drop policy if exists "Allow update" on public.notes;
-- create policy "Allow update" on public.notes for update using (true);
-- drop policy if exists "Allow delete" on public.notes;
-- create policy "Allow delete" on public.notes for delete using (true);
