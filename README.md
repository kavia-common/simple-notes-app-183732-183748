# simple-notes-app-183732-183748

A simple notes application with a React frontend that connects directly to Supabase for CRUD operations on a notes table.

## Supabase Setup (Step-by-Step)

Follow these steps to provision Supabase and configure the frontend:

1) Create a Supabase project
- Go to https://supabase.com and create/sign in to your account.
- Create a new project.
- From Project Settings > Database > Connection Info, note your Project URL and anon public key.

2) Configure your database schema
You can either:
- Option A (recommended): Run the schema file in the Supabase SQL editor.
  - Open the SQL editor in the Supabase dashboard.
  - Copy and paste the contents of supabase/schema.sql from this repository and run it.
- Option B: Use the inline SQL below in the SQL editor.

Inline SQL schema:
- Creates a public.notes table with id, title, content, created_at, updated_at.
- Adds a trigger to automatically update updated_at on updates.

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

3) Set Row Level Security (optional, for public access without auth)
If you are not using authentication and want to allow the frontend to read/write without a user session, enable RLS and add permissive policies. WARNING: This is for demo/dev purposes only.

```sql
alter table public.notes enable row level security;

drop policy if exists "Allow read" on public.notes;
create policy "Allow read" on public.notes
for select using (true);

drop policy if exists "Allow insert" on public.notes;
create policy "Allow insert" on public.notes
for insert with check (true);

drop policy if exists "Allow update" on public.notes;
create policy "Allow update" on public.notes
for update using (true);

drop policy if exists "Allow delete" on public.notes;
create policy "Allow delete" on public.notes
for delete using (true);
```

4) Configure environment variables in the frontend
This container expects the following environment variables to be set in simple-notes-app-183732-183748/notes_frontend/.env:

Required for Supabase:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Other optional environment variables supported by the template (unused by core logic but supported for consistency):
- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

Example .env (create this file under notes_frontend):
```
REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
REACT_APP_SUPABASE_KEY=YOUR-ANON-PUBLIC-KEY
```

Note: Do not commit real keys to source control. The orchestrator will handle setting environment variables in deployment environments.

5) Run the app
- cd notes_frontend
- npm install
- npm start
Open http://localhost:3000 in your browser.

## Where the Supabase client is used

- src/lib/supabaseClient.js reads REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY from environment variables and creates a singleton Supabase client.
- src/services/notesService.js uses the client to perform CRUD against the notes table.
- src/hooks/useNotes.js provides the UI-facing data and actions with a small debounced autosave.

## Schema file

This repository provides an optional schema file at supabase/schema.sql which matches the SQL shown above. You can import it directly in the Supabase SQL editor.

## Security note

For production, do not use permissive RLS policies that allow anonymous write access. Integrate authentication and write restrictive policies that scope data by user (e.g., add a user_id column and use auth.uid()).
