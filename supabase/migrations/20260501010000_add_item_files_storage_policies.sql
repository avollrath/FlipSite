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
