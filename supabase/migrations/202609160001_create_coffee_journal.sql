create table if not exists public.coffee_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Coffee log',
  bean text,
  roaster text,
  origin text,
  recipe text,
  brew_method text,
  dose text,
  water text,
  grind text,
  temperature text,
  tasting_notes text,
  changes text,
  rating smallint not null default 0 check (rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coffee_journal_user_created_idx
  on public.coffee_journal (user_id, created_at desc);

alter table public.coffee_journal enable row level security;

revoke all on table public.coffee_journal from anon;
grant select, insert, update, delete on table public.coffee_journal to authenticated;

drop policy if exists "Users can view their own journal entries" on public.coffee_journal;
drop policy if exists "Users can create their own journal entries" on public.coffee_journal;
drop policy if exists "Users can update their own journal entries" on public.coffee_journal;
drop policy if exists "Users can delete their own journal entries" on public.coffee_journal;

create policy "Users can view their own journal entries"
  on public.coffee_journal for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own journal entries"
  on public.coffee_journal for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own journal entries"
  on public.coffee_journal for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own journal entries"
  on public.coffee_journal for delete to authenticated
  using ((select auth.uid()) = user_id);
