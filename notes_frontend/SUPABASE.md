# Supabase Integration

This frontend expects a Supabase project with a `notes` table:

```sql
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- optional: keep updated_at in sync
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

Environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Place them in a `.env` file in the `notes_frontend` directory based on `.env.example`.
