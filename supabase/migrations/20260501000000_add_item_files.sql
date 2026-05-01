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
