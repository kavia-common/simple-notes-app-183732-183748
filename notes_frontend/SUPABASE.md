# Supabase Integration

This frontend connects directly to Supabase and expects a `notes` table.

You can create the schema using the repository-provided SQL file:
- File: ../supabase/schema.sql
- Open Supabase SQL editor in your project, paste the file contents, and run.

Inline SQL (for reference):
```sql
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
```

Environment variables (set these in notes_frontend/.env):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Example .env:
```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
REACT_APP_SUPABASE_KEY=YOUR-ANON-PUBLIC-KEY
```

Notes:
- Do not hardcode credentials; use environment variables.
- For production, implement proper Row Level Security with auth instead of permissive policies.
