---
name: testing
description: 'Beauty Lash & Brow 테스트 작성 가이드. Vitest + React Testing Library 기반 단위/통합 테스트, Playwright E2E 테스트, Supabase 모킹, 도메인 로직 테스트 작성 시 사용. 새 기능 개발 시 테스트 작성, 버그 수정 후 회귀 테스트 추가, 테스트 커버리지 개선 등 테스트 관련 모든 작업에서 이 스킬을 반드시 참고할 것.'
---

# 테스트 가이드

## 테스트 피라미드

```
         ╱ E2E ╲           Playwright (핵심 플로우만)
        ╱ 통합  ╲          RTL + Vitest (컴포넌트 + API)
       ╱ 단위    ╲         Vitest (도메인 로직, 유틸)
```

작성 비율: 단위 60% / 통합 30% / E2E 10%

## 테스트 도구

| 도구                        | 용도                               |
| --------------------------- | ---------------------------------- |
| Vitest                      | 테스트 러너, 단위/통합 테스트      |
| React Testing Library (RTL) | 컴포넌트 렌더링/인터랙션 테스트    |
| @testing-library/jest-dom   | 커스텀 매처 (toBeInTheDocument 등) |
| MSW (Mock Service Worker)   | API 모킹 (추후 필요 시)            |
| Playwright                  | E2E 테스트 (Phase 4)               |

## 디렉토리 구조

```
__tests__/
├── unit/
│   ├── domain/
│   │   ├── reservation/
│   │   │   └── rules.test.ts     # 예약 비즈니스 규칙 테스트
│   │   └── ...
│   └── utils/
│       └── format.test.ts        # 유틸 함수 테스트
├── integration/
│   ├── components/
│   │   ├── ReviewForm.test.tsx    # 폼 컴포넌트 통합 테스트
│   │   ├── ReservationCalendar.test.tsx
│   │   └── ...
│   └── actions/
│       └── reservation.test.ts   # Server Action 테스트
├── e2e/
│   ├── reservation-flow.spec.ts  # 예약 전체 플로우
│   └── auth-flow.spec.ts         # 인증 플로우
├── mocks/
│   ├── supabase.ts               # Supabase 클라이언트 모킹
│   └── data.ts                   # 테스트 픽스처 데이터
└── setup.ts                      # 글로벌 테스트 설정
```

## Vitest 설정

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './__tests__/setup.ts',
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```typescript
// __tests__/setup.ts
import '@testing-library/jest-dom/vitest';
```

## 단위 테스트 패턴

도메인 규칙은 순수 함수이므로 가장 테스트하기 쉽다. 이것을 최우선으로 작성한다.

```typescript
// __tests__/unit/domain/reservation/rules.test.ts
import { describe, it, expect } from 'vitest';
import { canCancelReservation } from '@/lib/domain/reservation/rules';

describe('canCancelReservation', () => {
  const baseReservation = {
    id: 'test-id',
    date: '2026-03-20',
    time_slot: '14:00',
    status: 'confirmed' as const,
    user_id: 'user-1',
  };

  it('예약 시간 2시간 이상 전이면 취소 가능', () => {
    const now = new Date('2026-03-20T11:00:00');
    const result = canCancelReservation(baseReservation, now);
    expect(result.ok).toBe(true);
  });

  it('예약 시간 2시간 미만이면 취소 불가', () => {
    const now = new Date('2026-03-20T12:30:00');
    const result = canCancelReservation(baseReservation, now);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('2시간');
  });

  it('이미 취소된 예약은 다시 취소 불가', () => {
    const cancelled = { ...baseReservation, status: 'cancelled' as const };
    const result = canCancelReservation(cancelled);
    expect(result.ok).toBe(false);
  });
});
```

## 컴포넌트 테스트 패턴

RTL의 원칙: "사용자가 보는 것을 테스트한다" (구현 상세가 아닌 행동 테스트)

```typescript
// __tests__/integration/components/ReviewForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewForm } from '@/components/domain/review/ReviewForm';

describe('ReviewForm', () => {
  it('제목 미입력 시 에러 메시지를 표시한다', async () => {
    render(<ReviewForm />);

    const submitButton = screen.getByRole('button', { name: /작성하기/ });
    await userEvent.click(submitButton);

    expect(await screen.findByText('제목을 입력하세요')).toBeInTheDocument();
  });

  it('50자 초과 제목 입력 시 에러를 표시한다', async () => {
    render(<ReviewForm />);

    const titleInput = screen.getByLabelText('제목');
    await userEvent.type(titleInput, 'a'.repeat(51));

    const submitButton = screen.getByRole('button', { name: /작성하기/ });
    await userEvent.click(submitButton);

    expect(await screen.findByText('50자 이내')).toBeInTheDocument();
  });

  it('유효한 입력 시 onSubmit을 호출한다', async () => {
    const onSubmit = vi.fn();
    render(<ReviewForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('제목'), '좋은 경험이었습니다');
    await userEvent.type(screen.getByLabelText('내용'), '시술이 정말 만족스러웠어요. 친절하게 설명해주셔서 좋았습니다.');

    await userEvent.click(screen.getByRole('button', { name: /작성하기/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Supabase 모킹

```typescript
// __tests__/mocks/supabase.ts
import { vi } from 'vitest';

export function createMockSupabaseClient() {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  });

  return {
    from: mockFrom,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } }),
      }),
    },
  };
}
```

## 테스트 픽스처

```typescript
// __tests__/mocks/data.ts
export const mockUser = {
  id: 'user-1',
  name: '테스트 사용자',
  phone: '010-1234-5678',
  role: 'user' as const,
};

export const mockAdmin = {
  id: 'admin-1',
  name: '관리자',
  phone: '010-0000-0000',
  role: 'admin' as const,
};

export const mockService = {
  id: 'service-1',
  category: '속눈썹',
  name: '내추럴 속눈썹 연장',
  price: 70000,
  duration_minutes: 90,
  is_active: true,
};

export const mockReservation = {
  id: 'res-1',
  user_id: 'user-1',
  service_id: 'service-1',
  date: '2026-03-25',
  time_slot: '14:00',
  status: 'pending' as const,
  memo: '처음 방문합니다',
};
```

## 테스트 실행 명령어

```bash
# 특정 파일 테스트
pnpm test -- --testPathPattern=reservation

# 특정 describe/it 블록만 실행
pnpm test -- --testNamePattern="취소"

# 워치 모드 (파일 변경 시 자동 재실행)
pnpm test:watch

# 커버리지 확인
pnpm test:coverage
```

## 테스트 작성 원칙

1. **도메인 규칙을 먼저 테스트**: `canCancelReservation`, `canCreateReservation` 등 순수 함수 우선
2. **행동 기반 테스트**: "버튼 클릭 시 에러 표시" (O), "useState가 변경됨" (X)
3. **한 테스트에 한 가지 검증**: 여러 assert를 넣지 않는다
4. **테스트명은 한국어로**: `it('예약 시간 2시간 미만이면 취소 불가')` — 명확한 의도 전달
5. **외부 의존성은 모킹**: Supabase, Telegram API 등은 항상 모킹

## 커버리지 목표

| 영역                            | 최소 커버리지 |
| ------------------------------- | ------------- |
| 도메인 규칙 (`lib/domain/`)     | 90%           |
| 유틸 함수 (`lib/utils/`)        | 80%           |
| 컴포넌트 (`components/domain/`) | 60%           |
| Server Actions (`lib/actions/`) | 70%           |

## 상세 레퍼런스

- E2E 테스트 시나리오: `references/e2e-scenarios.md`
- 모킹 패턴 상세: `references/mock-patterns.md`
