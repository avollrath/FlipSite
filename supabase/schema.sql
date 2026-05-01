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

create table if not exists public.item_files (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (tsid) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  file_path text not null,
  file_type text not null,
  original_name text,
  mime_type text,
  size_bytes integer,
  created_at timestamptz not null default now()
);

alter table public.item_files enable row level security;

create index if not exists item_files_item_id_idx on public.item_files (item_id);
create index if not exists item_files_user_id_idx on public.item_files (user_id);

drop policy if exists "Users can select their own files" on public.item_files;
create policy "Users can select their own files"
on public.item_files
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own files" on public.item_files;
create policy "Users can insert their own files"
on public.item_files
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.items as i
    where i.tsid = public.item_files.item_id
      and i.user_id = public.item_files.user_id
  )
);

drop policy if exists "Users can delete their own files" on public.item_files;
create policy "Users can delete their own files"
on public.item_files
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, delete on public.item_files to authenticated;

insert into storage.buckets (id, name, public)
values ('item-files', 'item-files', false)
on conflict (id) do update
set public = false;

drop policy if exists "Users can select their own item file objects" on storage.objects;
create policy "Users can select their own item file objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'item-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can upload their own item file objects" on storage.objects;
create policy "Users can upload their own item file objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Users can delete their own item file objects" on storage.objects;
create policy "Users can delete their own item file objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'item-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Run this in Supabase SQL Editor to add keeper status support:
-- ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;
-- ALTER TABLE items ADD CONSTRAINT items_status_check
--   CHECK (status IN ('holding', 'listed', 'sold', 'keeper'));

-- Bundle support migration - run in Supabase SQL Editor:
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS bundle_id uuid REFERENCES items(tsid) ON DELETE SET NULL;
-- ALTER TABLE items ADD COLUMN IF NOT EXISTS is_bundle_parent boolean DEFAULT false;
