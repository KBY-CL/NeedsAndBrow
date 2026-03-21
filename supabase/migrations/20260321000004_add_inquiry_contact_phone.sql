-- inquiries 테이블에 연락처 컬럼 추가
alter table public.inquiries
  add column if not exists contact_phone text not null default '';

-- 기존 데이터는 빈 문자열로 처리 (already handled by default)
-- 이후에는 default 제거하여 필수값으로 관리
alter table public.inquiries
  alter column contact_phone drop default;
