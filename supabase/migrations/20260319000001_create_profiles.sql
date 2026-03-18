-- ============================================================
-- Migration 1: 헬퍼 함수 + profiles 테이블
-- ============================================================

-- 헬퍼 함수: 현재 사용자가 관리자인지 확인
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- profiles 테이블
-- ============================================================
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  name          text        not null,
  phone         text,
  role          text        not null default 'user' check (role in ('user', 'admin')),
  avatar_url    text,
  is_active     boolean     not null default true,
  deactivated_at timestamptz,
  created_at    timestamptz not null default now()
);

-- 인덱스
create index idx_profiles_role      on public.profiles(role);
create index idx_profiles_is_active on public.profiles(is_active);

-- RLS 활성화
alter table public.profiles enable row level security;

-- 본인 읽기
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- 관리자 전체 읽기
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.is_admin());

-- 본인 수정 (role 변경 불가는 애플리케이션 레이어에서 처리)
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 관리자 수정
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin());

-- ============================================================
-- 트리거: auth.users 생성 시 profiles 자동 생성
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '사용자'),
    coalesce(new.raw_user_meta_data->>'phone', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
