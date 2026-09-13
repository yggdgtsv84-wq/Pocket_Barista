create extension if not exists pgcrypto;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  method text not null default 'Pour Over',
  coffee_g numeric not null check (coffee_g > 0),
  water_g numeric not null check (water_g > 0),
  ratio numeric not null check (ratio > 0),
  grind text,
  temperature_c numeric check (temperature_c between 0 and 120),
  brew_seconds integer check (brew_seconds >= 0),
  notes text,
  rating smallint not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipes_user_created_idx on public.recipes (user_id, created_at desc);

alter table public.recipes enable row level security;

revoke all on table public.recipes from anon;
grant select, insert, update, delete on table public.recipes to authenticated;

drop policy if exists "Users can read their recipes" on public.recipes;
drop policy if exists "Users can create their recipes" on public.recipes;
drop policy if exists "Users can update their recipes" on public.recipes;
drop policy if exists "Users can delete their recipes" on public.recipes;

create policy "Users can read their recipes" on public.recipes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their recipes" on public.recipes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their recipes" on public.recipes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their recipes" on public.recipes
  for delete to authenticated
  using ((select auth.uid()) = user_id);
