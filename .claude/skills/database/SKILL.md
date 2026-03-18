---
name: database
description: 'Beauty Lash & Brow 데이터베이스 설계 및 관리 가이드. Supabase PostgreSQL 스키마, 마이그레이션, Row Level Security(RLS) 정책, 인덱스, 트리거, 쿼리 최적화 작업 시 사용. 테이블 추가/수정, RLS 정책 변경, DB 함수 작성, 마이그레이션 파일 생성 등 데이터베이스 관련 모든 작업에서 이 스킬을 반드시 참고할 것.'
---

# 데이터베이스 설계 가이드

Supabase PostgreSQL 기반. RLS(Row Level Security)로 데이터 접근 제어.
Free Plan 제약(500MB DB, 1GB Storage)을 고려한 효율적 설계.

## 스키마 개요

```
테이블              설명                   주요 관계
──────────────────────────────────────────────────────
profiles           사용자 프로필           FK → auth.users
services           시술 서비스             -
reservations       예약                   FK → profiles, services
blocked_dates      예약 마감일             -
time_slots         시간 슬롯 설정          -
gallery            B&A 갤러리             -
reviews            시술 후기              FK → profiles
events             이벤트                 -
inquiries          상담 문의              FK → profiles (nullable)
shop_info          매장 정보              단일 레코드
```

전체 테이블 컬럼 정의는 `references/schema-detail.md` 참고.

## 마이그레이션 관리

마이그레이션 파일은 `supabase/migrations/` 에 타임스탬프 기반으로 생성한다:

```bash
# 새 마이그레이션 생성
supabase migration new <설명>

# 예시
supabase migration new create_profiles_table
supabase migration new add_rls_policies
supabase migration new create_reservation_system
```

### 마이그레이션 작성 규칙

1. 하나의 마이그레이션 파일은 하나의 논리적 변경만 담는다
2. `UP` 마이그레이션만 작성 (Supabase는 down 미지원)
3. RLS 정책은 테이블 생성과 같은 파일에 포함
4. 시드 데이터는 별도 파일 (`supabase/seed.sql`)

```sql
-- 예시: supabase/migrations/20260318000001_create_profiles.sql

-- profiles 테이블
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  is_active boolean not null default true,
  deactivated_at timestamptz,
  created_at timestamptz not null default now()
);

-- 인덱스
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_is_active on public.profiles(is_active);

-- RLS 활성화
alter table public.profiles enable row level security;

-- RLS 정책
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 트리거: auth.users 생성 시 profiles 자동 생성
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
```

## RLS 정책 설계 원칙

### 헬퍼 함수

자주 사용하는 권한 체크를 함수로 정의한다:

```sql
-- 현재 사용자가 관리자인지 확인
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;
```

### 정책 패턴

```sql
-- 패턴 1: 모두 읽기 가능, 관리자만 쓰기
-- (services, gallery, events, shop_info, time_slots, blocked_dates)
create policy "공개_읽기" on public.services
  for select using (true);

create policy "관리자_쓰기" on public.services
  for insert using (public.is_admin());

create policy "관리자_수정" on public.services
  for update using (public.is_admin());

create policy "관리자_삭제" on public.services
  for delete using (public.is_admin());

-- 패턴 2: 본인 + 관리자 읽기/쓰기
-- (reservations, profiles)
create policy "예약_본인_읽기" on public.reservations
  for select using (
    auth.uid() = user_id or public.is_admin()
  );

-- 패턴 3: 모두 읽기, 회원만 쓰기, 본인만 수정
-- (reviews)
create policy "후기_읽기" on public.reviews
  for select using (true);

create policy "후기_작성" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "후기_수정" on public.reviews
  for update using (
    auth.uid() = user_id or public.is_admin()
  );
```

## 인덱스 전략

```sql
-- 자주 조회되는 필터 조건에 인덱스 생성
create index idx_reservations_date on public.reservations(date);
create index idx_reservations_status on public.reservations(status);
create index idx_reservations_user_date on public.reservations(user_id, date);
create index idx_reviews_created on public.reviews(created_at desc);
create index idx_events_dates on public.events(start_date, end_date);
create index idx_inquiries_status on public.inquiries(status);
create index idx_gallery_category on public.gallery(category);
```

## Storage 버킷 설정

```sql
-- gallery 버킷 (B&A 이미지)
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true);

-- reviews 버킷 (후기 이미지)
insert into storage.buckets (id, name, public)
values ('reviews', 'reviews', true);

-- events 버킷 (이벤트 이미지)
insert into storage.buckets (id, name, public)
values ('events', 'events', true);

-- avatars 버킷 (프로필 이미지)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

Storage RLS:

```sql
-- 갤러리: 모두 읽기, 관리자만 업로드/삭제
create policy "gallery_read" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "gallery_write" on storage.objects
  for insert with check (
    bucket_id = 'gallery' and public.is_admin()
  );
```

## DB 함수

복잡한 쿼리나 트랜잭션은 PostgreSQL 함수로 작성한다:

```sql
-- 예약 확정 처리 (트랜잭션)
create or replace function public.confirm_reservation(
  p_reservation_id uuid,
  p_admin_note text default null
)
returns void as $$
begin
  update public.reservations
  set status = 'confirmed',
      admin_note = p_admin_note,
      updated_at = now()
  where id = p_reservation_id
    and status = 'pending';

  if not found then
    raise exception 'Reservation not found or not pending';
  end if;
end;
$$ language plpgsql security definer;
```

## Supabase Free Plan 용량 관리

- 이미지: 클라이언트에서 반드시 리사이즈 + WebP 변환 후 업로드
- 오래된 데이터: 6개월 이상 지난 취소 예약은 주기적 정리 (Cron)
- Storage 모니터링: Supabase Dashboard에서 정기 확인

## 상세 레퍼런스

- 전체 테이블 컬럼 정의: `references/schema-detail.md`
- RLS 정책 전체 목록: `references/rls-policies.md`
- 시드 데이터: `references/seed-data.md`
