-- services 테이블에 is_hidden 컬럼 추가
alter table public.services
  add column if not exists is_hidden boolean not null default false;
