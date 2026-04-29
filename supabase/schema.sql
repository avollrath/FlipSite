create extension if not exists pgcrypto with schema extensions;

create table if not exists public.items (
  tsid uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  condition text not null,
  buy_price numeric(12, 2) not null check (buy_price >= 0),
  sell_price numeric(12, 2) check (sell_price is null or sell_price >= 0),
  platform text not null,
  -- Status values: holding, listed, sold, keeper.
  -- Existing Supabase databases need the manual constraint update block at the bottom of this file.
  status text not null default 'holding' check (status in ('holding', 'listed', 'sold', 'keeper')),
  bought_at timestamptz not null,
  sold_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

create index if not exists items_user_id_idx on public.items (user_id);

drop policy if exists "Users can select their own items" on public.items;
create policy "Users can select their own items"
on public.items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own items" on public.items;
create policy "Users can insert their own items"
on public.items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own items" on public.items;
create policy "Users can update their own items"
on public.items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own items" on public.items;
create policy "Users can delete their own items"
on public.items
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.items to authenticated;

-- Run this in Supabase SQL Editor to add keeper status support:
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;
-- ALTER TABLE items ADD CONSTRAINT items_status_check
--   CHECK (status IN ('holding', 'listed', 'sold', 'keeper'));
