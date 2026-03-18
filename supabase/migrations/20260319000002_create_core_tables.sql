-- ============================================================
-- Migration 2: 예약 관련 핵심 테이블
-- services, reservations, blocked_dates, time_slots
-- ============================================================

-- ============================================================
-- services (시술 서비스)
-- ============================================================
create table public.services (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  category      text        not null check (category in ('속눈썹연장', '눈썹문신', '기타')),
  description   text,
  duration      int         not null default 60,   -- 분 단위
  price         int         not null,
  is_active     boolean     not null default true,
  sort_order    int         not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_services_category   on public.services(category);
create index idx_services_is_active  on public.services(is_active);
create index idx_services_sort_order on public.services(sort_order);

alter table public.services enable row level security;

-- 모두 읽기 가능
create policy "services_select_all"
  on public.services for select
  using (true);

-- 관리자만 삽입/수정/삭제
create policy "services_insert_admin"
  on public.services for insert
  with check (public.is_admin());

create policy "services_update_admin"
  on public.services for update
  using (public.is_admin());

create policy "services_delete_admin"
  on public.services for delete
  using (public.is_admin());

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ============================================================
-- time_slots (시간 슬롯 설정)
-- ============================================================
create table public.time_slots (
  id               uuid    primary key default gen_random_uuid(),
  time             text    not null,             -- '10:00', '11:00' 등 HH:MM 형식
  is_active        boolean not null default true,
  max_reservations int     not null default 1,   -- 해당 시간대 최대 예약 수
  sort_order       int     not null default 0,
  unique (time)
);

create index idx_time_slots_is_active  on public.time_slots(is_active);
create index idx_time_slots_sort_order on public.time_slots(sort_order);

alter table public.time_slots enable row level security;

create policy "time_slots_select_all"
  on public.time_slots for select
  using (true);

create policy "time_slots_insert_admin"
  on public.time_slots for insert
  with check (public.is_admin());

create policy "time_slots_update_admin"
  on public.time_slots for update
  using (public.is_admin());

create policy "time_slots_delete_admin"
  on public.time_slots for delete
  using (public.is_admin());

-- ============================================================
-- blocked_dates (예약 마감일)
-- ============================================================
create table public.blocked_dates (
  id         uuid        primary key default gen_random_uuid(),
  date       date        not null unique,
  reason     text,
  created_at timestamptz not null default now()
);

create index idx_blocked_dates_date on public.blocked_dates(date);

alter table public.blocked_dates enable row level security;

create policy "blocked_dates_select_all"
  on public.blocked_dates for select
  using (true);

create policy "blocked_dates_insert_admin"
  on public.blocked_dates for insert
  with check (public.is_admin());

create policy "blocked_dates_update_admin"
  on public.blocked_dates for update
  using (public.is_admin());

create policy "blocked_dates_delete_admin"
  on public.blocked_dates for delete
  using (public.is_admin());

-- ============================================================
-- reservations (예약)
-- ============================================================
create table public.reservations (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  service_id   uuid        not null references public.services(id) on delete restrict,
  date         date        not null,
  time_slot    text        not null,              -- '10:00' 형식
  status       text        not null default 'pending'
                           check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  user_note    text,                              -- 고객 메모
  admin_note   text,                              -- 관리자 메모
  cancelled_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_reservations_user_id   on public.reservations(user_id);
create index idx_reservations_date      on public.reservations(date);
create index idx_reservations_status    on public.reservations(status);
create index idx_reservations_user_date on public.reservations(user_id, date);
create index idx_reservations_date_time on public.reservations(date, time_slot);

alter table public.reservations enable row level security;

-- 본인 또는 관리자만 읽기
create policy "reservations_select"
  on public.reservations for select
  using (auth.uid() = user_id or public.is_admin());

-- 로그인 사용자만 예약 생성 (본인 명의)
create policy "reservations_insert"
  on public.reservations for insert
  with check (auth.uid() = user_id);

-- 관리자만 수정 (상태 변경 등)
create policy "reservations_update_admin"
  on public.reservations for update
  using (public.is_admin());

-- 본인이 취소 (애플리케이션 레이어에서 2시간 전 규칙 검증)
create policy "reservations_cancel_own"
  on public.reservations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- ============================================================
-- DB 함수: 예약 확정 처리
-- ============================================================
create or replace function public.confirm_reservation(
  p_reservation_id uuid,
  p_admin_note     text default null
)
returns void as $$
begin
  update public.reservations
  set    status     = 'confirmed',
         admin_note = p_admin_note,
         updated_at = now()
  where  id     = p_reservation_id
    and  status = 'pending';

  if not found then
    raise exception 'Reservation not found or not in pending status';
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- DB 함수: 예약 불가 처리
-- ============================================================
create or replace function public.reject_reservation(
  p_reservation_id uuid,
  p_admin_note     text default null
)
returns void as $$
begin
  update public.reservations
  set    status     = 'rejected',
         admin_note = p_admin_note,
         updated_at = now()
  where  id     = p_reservation_id
    and  status = 'pending';

  if not found then
    raise exception 'Reservation not found or not in pending status';
  end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- DB 함수: 예약 취소 (2시간 전 규칙 검증 포함)
-- ============================================================
create or replace function public.cancel_reservation(
  p_reservation_id uuid
)
returns void as $$
declare
  v_reservation public.reservations;
  v_reservation_dt timestamptz;
begin
  select * into v_reservation
  from public.reservations
  where id = p_reservation_id
    and user_id = auth.uid()
    and status in ('pending', 'confirmed');

  if not found then
    raise exception 'Reservation not found or cannot be cancelled';
  end if;

  -- 예약 날짜+시간 계산
  v_reservation_dt := (v_reservation.date::text || ' ' || v_reservation.time_slot)::timestamptz
                      at time zone 'Asia/Seoul';

  -- 2시간 전 규칙 검증
  if v_reservation_dt - now() < interval '2 hours' then
    raise exception 'Cannot cancel reservation within 2 hours of appointment';
  end if;

  update public.reservations
  set    status       = 'cancelled',
         cancelled_at = now(),
         updated_at   = now()
  where  id = p_reservation_id;
end;
$$ language plpgsql security definer;
