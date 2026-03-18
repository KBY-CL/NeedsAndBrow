-- ============================================================
-- Migration 4: Storage 버킷 + 스토리지 RLS
-- ============================================================

-- 버킷 생성
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery',  'gallery',  true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('reviews',  'reviews',  true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('events',   'events',   true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars',  'avatars',  true, 2097152,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- ============================================================
-- gallery 버킷 RLS
-- ============================================================
create policy "gallery_storage_read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "gallery_storage_update"
  on storage.objects for update
  using (bucket_id = 'gallery' and public.is_admin());

create policy "gallery_storage_delete"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_admin());

-- ============================================================
-- reviews 버킷 RLS
-- ============================================================
create policy "reviews_storage_read"
  on storage.objects for select
  using (bucket_id = 'reviews');

-- 파일 경로 규칙: reviews/{user_id}/{filename}
create policy "reviews_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'reviews'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reviews_storage_update"
  on storage.objects for update
  using (
    bucket_id = 'reviews'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "reviews_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'reviews'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ============================================================
-- events 버킷 RLS
-- ============================================================
create policy "events_storage_read"
  on storage.objects for select
  using (bucket_id = 'events');

create policy "events_storage_insert"
  on storage.objects for insert
  with check (bucket_id = 'events' and public.is_admin());

create policy "events_storage_update"
  on storage.objects for update
  using (bucket_id = 'events' and public.is_admin());

create policy "events_storage_delete"
  on storage.objects for delete
  using (bucket_id = 'events' and public.is_admin());

-- ============================================================
-- avatars 버킷 RLS
-- ============================================================
create policy "avatars_storage_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 파일 경로 규칙: avatars/{user_id}/{filename}
create policy "avatars_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_storage_update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
