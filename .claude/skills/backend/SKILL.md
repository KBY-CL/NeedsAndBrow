---
name: backend
description: 'Beauty Lash & Brow 백엔드 개발 가이드. Domain-Driven Design(DDD) 기반 아키텍처. Server Actions, API Routes, Supabase Edge Functions, 비즈니스 로직, Telegram 알림 구현 시 사용. 예약 처리 로직, 인증 플로우, 데이터 접근 계층, 파일 업로드 등 서버사이드 로직을 작성할 때 이 스킬을 반드시 참고할 것.'
---

# 백엔드 개발 가이드 (DDD)

Supabase를 BaaS로 활용하되, 비즈니스 로직은 DDD 패턴으로 구조화한다.
Next.js Server Actions를 기본 데이터 변형 수단으로 사용하고, 외부 연동이나 웹훅은 API Routes 또는 Edge Functions를 사용한다.

## 도메인 구조

이 프로젝트의 핵심 도메인은 다음과 같다:

```
도메인 (Domain)      Bounded Context
─────────────────────────────────────
auth                 인증, 회원관리, 프로필
reservation          예약 문의, 시간슬롯, 예약마감
service              시술 서비스, 카테고리, 가격
gallery              Before&After 갤러리
review               시술 후기
event                이벤트/프로모션
inquiry              상담 문의
shop                 매장 정보 (위치, 운영시간)
notification         푸시 알림 (Telegram)
```

## 아키텍처 레이어

```
lib/
├── actions/          # Server Actions (Application Layer)
│   ├── auth.ts       # 인증 관련 액션
│   ├── reservation.ts
│   ├── review.ts
│   ├── event.ts
│   ├── inquiry.ts
│   ├── gallery.ts
│   ├── service.ts
│   └── shop.ts
├── domain/           # Domain Layer (비즈니스 규칙)
│   ├── reservation/
│   │   ├── types.ts           # 도메인 타입/인터페이스
│   │   ├── rules.ts           # 비즈니스 규칙 (순수 함수)
│   │   └── errors.ts          # 도메인 에러
│   ├── auth/
│   └── ...
├── supabase/         # Infrastructure Layer (데이터 접근)
│   ├── client.ts     # 브라우저 클라이언트
│   ├── server.ts     # 서버 클라이언트 (cookies 기반)
│   ├── admin.ts      # 서비스 롤 클라이언트 (관리자 전용)
│   └── queries/      # 재사용 가능한 쿼리 함수
│       ├── reservation.ts
│       ├── review.ts
│       └── ...
└── services/         # 외부 서비스 연동
    ├── telegram.ts   # Telegram Bot API
    ├── image.ts      # 이미지 처리 (리사이즈, WebP)
    └── sms.ts        # (추후 카카오 알림톡)
```

## Server Actions 패턴

Server Actions를 Application Layer로 사용한다. 각 액션은 입력 검증 → 권한 확인 → 비즈니스 규칙 적용 → 데이터 저장 → 부수효과(알림) 순서로 처리한다.

```typescript
// lib/actions/reservation.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { canCreateReservation, canCancelReservation } from '@/lib/domain/reservation/rules';
import { sendTelegramNotification } from '@/lib/services/telegram';
import { revalidatePath } from 'next/cache';

const CreateReservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.string(),
  serviceId: z.string().uuid(),
  memo: z.string().max(500).optional(),
});

export async function createReservation(formData: FormData) {
  // 1. 입력 검증
  const parsed = CreateReservationSchema.safeParse({
    date: formData.get('date'),
    timeSlot: formData.get('timeSlot'),
    serviceId: formData.get('serviceId'),
    memo: formData.get('memo'),
  });
  if (!parsed.success) return { error: '입력값을 확인하세요.' };

  // 2. 인증/권한 확인
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  // 3. 비즈니스 규칙 검증
  const ruleResult = await canCreateReservation(supabase, {
    userId: user.id,
    ...parsed.data,
  });
  if (!ruleResult.ok) return { error: ruleResult.reason };

  // 4. 데이터 저장
  const { data, error } = await supabase
    .from('reservations')
    .insert({ user_id: user.id, ...parsed.data, status: 'pending' })
    .select()
    .single();
  if (error) return { error: '예약 문의에 실패했습니다.' };

  // 5. 부수효과 (알림)
  await sendTelegramNotification('new_reservation', data);

  // 6. 캐시 갱신
  revalidatePath('/admin/reservations');
  revalidatePath('/reservation/my');

  return { success: true, data };
}
```

## 도메인 규칙 (Domain Rules)

비즈니스 규칙은 순수 함수로 작성하여 테스트 가능하게 만든다:

```typescript
// lib/domain/reservation/rules.ts

// 예약 취소 가능 여부: 예약 시간 2시간 전까지만 가능
export function canCancelReservation(reservation: Reservation, now: Date = new Date()): RuleResult {
  const reservationTime = new Date(`${reservation.date}T${reservation.time_slot}`);
  const hoursUntil = (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 2) {
    return { ok: false, reason: '예약 시간 2시간 전까지만 취소 가능합니다.' };
  }
  if (reservation.status === 'cancelled') {
    return { ok: false, reason: '이미 취소된 예약입니다.' };
  }
  return { ok: true };
}

// 예약 생성 가능 여부
export async function canCreateReservation(
  supabase: SupabaseClient,
  input: CreateReservationInput,
): Promise<RuleResult> {
  // 1. 마감일 체크
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', input.date)
    .single();
  if (blocked) return { ok: false, reason: '해당 날짜는 예약이 마감되었습니다.' };

  // 2. 중복 예약 체크
  const { data: existing } = await supabase
    .from('reservations')
    .select('id')
    .eq('date', input.date)
    .eq('time_slot', input.timeSlot)
    .in('status', ['pending', 'confirmed']);
  if (existing?.length) return { ok: false, reason: '해당 시간은 이미 예약되었습니다.' };

  return { ok: true };
}
```

## Supabase 클라이언트 설정

```typescript
// lib/supabase/server.ts — 서버 컴포넌트/Server Actions용
import { createServerClient as _createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
  const cookieStore = await cookies();
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    },
  );
}
```

## Telegram 알림

```typescript
// lib/services/telegram.ts
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID!;

type NotificationType = 'new_reservation' | 'cancel_reservation' | 'new_inquiry';

export async function sendTelegramNotification(
  type: NotificationType,
  data: Record<string, unknown>,
) {
  const message = formatMessage(type, data);

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });
}
```

## 에러 처리

도메인별 커스텀 에러를 정의한다:

```typescript
// lib/domain/reservation/errors.ts
export class ReservationError extends Error {
  constructor(
    message: string,
    public code: 'SLOT_TAKEN' | 'DATE_BLOCKED' | 'CANCEL_TOO_LATE' | 'UNAUTHORIZED',
  ) {
    super(message);
    this.name = 'ReservationError';
  }
}
```

Server Actions의 반환값은 항상 `{ success: true, data } | { error: string }` 형태를 따른다. 예외를 throw하지 않고 Result 패턴을 사용한다.

## 파일 업로드

```typescript
// lib/services/image.ts
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string,
  path: string,
): Promise<string> {
  // 1. 리사이즈 (서버에서 처리 시 sharp 사용)
  // 2. Supabase Storage 업로드
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  // 3. Public URL 반환
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}
```

## 상세 레퍼런스

- 도메인별 비즈니스 규칙 전체 목록: `references/domain-rules.md`
- API Route 명세: `references/api-specs.md`
- Edge Function 가이드: `references/edge-functions.md`
