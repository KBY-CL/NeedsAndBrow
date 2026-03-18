-- ============================================================
-- Migration 3: 콘텐츠 테이블
-- gallery, reviews, events, inquiries, shop_info
-- ============================================================

-- ============================================================
-- gallery (Before & After 갤러리)
-- ============================================================
create table public.gallery (
  id          uuid        primary key default gen_random_uuid(),
  category    text        not null check (category in ('속눈썹연장', '눈썹문신', '기타')),
  before_url  text        not null,
  after_url   text        not null,
  description text,
  is_visible  boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now()
);

create index idx_gallery_category  on public.gallery(category);
create index idx_gallery_visible   on public.gallery(is_visible);
create index idx_gallery_sort      on public.gallery(sort_order);

alter table public.gallery enable row level security;

create policy "gallery_select_visible"
  on public.gallery for select
  using (is_visible = true or public.is_admin());

create policy "gallery_insert_admin"
  on public.gallery for insert
  with check (public.is_admin());

create policy "gallery_update_admin"
  on public.gallery for update
  using (public.is_admin());

create policy "gallery_delete_admin"
  on public.gallery for delete
  using (public.is_admin());

-- ============================================================
-- reviews (시술 후기)
-- ============================================================
create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  content     text        not null,
  images      text[]      not null default '{}',   -- 최대 5개 URL
  is_official boolean     not null default false,  -- 관리자 공식 후기 배지
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_reviews_user_id   on public.reviews(user_id);
create index idx_reviews_created   on public.reviews(created_at desc);
create index idx_reviews_official  on public.reviews(is_official);

alter table public.reviews enable row level security;

-- 모두 읽기 가능
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

-- 로그인 사용자만 작성 (본인 명의)
create policy "reviews_insert"
  on public.reviews for insert
  with check (auth.uid() = user_id);

-- 본인 또는 관리자 수정
create policy "reviews_update"
  on public.reviews for update
  using (auth.uid() = user_id or public.is_admin());

-- 본인 또는 관리자 삭제
create policy "reviews_delete"
  on public.reviews for delete
  using (auth.uid() = user_id or public.is_admin());

create trigger reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ============================================================
-- events (이벤트)
-- ============================================================
create table public.events (
  id         uuid        primary key default gen_random_uuid(),
  title      text        not null,
  content    text        not null,
  image_url  text,
  start_date date        not null,
  end_date   date        not null,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index idx_events_dates     on public.events(start_date, end_date);
create index idx_events_is_active on public.events(is_active);

alter table public.events enable row level security;

create policy "events_select_all"
  on public.events for select
  using (true);

create policy "events_insert_admin"
  on public.events for insert
  with check (public.is_admin());

create policy "events_update_admin"
  on public.events for update
  using (public.is_admin());

create policy "events_delete_admin"
  on public.events for delete
  using (public.is_admin());

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ============================================================
-- DB 함수: 이벤트 상태 계산
-- ============================================================
create or replace function public.get_event_status(
  p_start_date date,
  p_end_date   date
)
returns text as $$
  select case
    when current_date < p_start_date then '예정'
    when current_date > p_end_date   then '종료'
    else '진행중'
  end;
$$ language sql immutable;

-- ============================================================
-- inquiries (상담 문의)
-- ============================================================
create table public.inquiries (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references public.profiles(id) on delete set null,  -- 비회원 nullable
  title         text        not null,
  content       text        not null,
  password_hash text,                             -- 비회원 비밀번호 잠금 (bcrypt hash)
  answer        text,
  answered_at   timestamptz,
  status        text        not null default 'pending'
                            check (status in ('pending', 'answered')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_inquiries_user_id on public.inquiries(user_id);
create index idx_inquiries_status  on public.inquiries(status);
create index idx_inquiries_created on public.inquiries(created_at desc);

alter table public.inquiries enable row level security;

-- 목록: 제목+날짜+상태만 노출 (content는 애플리케이션에서 비밀번호 검증 후)
create policy "inquiries_select_list"
  on public.inquiries for select
  using (
    auth.uid() = user_id   -- 본인
    or public.is_admin()   -- 관리자
    or user_id is null     -- 비회원 (목록만 보임, 상세는 앱에서 비밀번호 검증)
  );

-- 누구나 문의 작성 가능 (비회원 포함)
create policy "inquiries_insert"
  on public.inquiries for insert
  with check (true);

-- 본인 또는 관리자 수정 (관리자는 답변 작성)
create policy "inquiries_update"
  on public.inquiries for update
  using (auth.uid() = user_id or public.is_admin());

-- 본인 또는 관리자 삭제
create policy "inquiries_delete"
  on public.inquiries for delete
  using (auth.uid() = user_id or public.is_admin());

create trigger inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- ============================================================
-- shop_info (매장 정보 - 단일 레코드)
-- ============================================================
create table public.shop_info (
  id           int         primary key default 1
                           check (id = 1),        -- 단일 레코드 보장
  name         text        not null default 'Beauty Lash & Brow',
  address      text        not null default '',
  phone        text        not null default '',
  kakao_url    text,
  instagram_url text,
  hours        jsonb       not null default '{}'::jsonb,  -- { "월": "10:00-19:00", ... }
  parking_info text,
  map_lat      numeric(10, 7),
  map_lng      numeric(10, 7),
  updated_at   timestamptz not null default now()
);

alter table public.shop_info enable row level security;

create policy "shop_info_select_all"
  on public.shop_info for select
  using (true);

create policy "shop_info_update_admin"
  on public.shop_info for update
  using (public.is_admin());

-- 초기 레코드 삽입
insert into public.shop_info (id) values (1)
  on conflict (id) do nothing;
