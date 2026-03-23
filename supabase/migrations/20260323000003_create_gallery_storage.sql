-- gallery 이미지용 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 누구나 읽기 가능 (공개 버킷)
CREATE POLICY "gallery_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- 관리자만 업로드/삭제 가능
CREATE POLICY "gallery_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );

CREATE POLICY "gallery_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery'
    AND auth.role() = 'authenticated'
    AND public.is_admin()
  );
