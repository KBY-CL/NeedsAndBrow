---
name: frontend
description: 'Needs Ann Brow 프론트엔드 개발 가이드. Next.js App Router 기반 페이지 생성, React 컴포넌트 작성, 라우팅, 상태관리(Zustand), 폼 처리(React Hook Form + Zod), 클라이언트/서버 컴포넌트 구분, 미들웨어, 이미지 최적화, SEO 작업 시 사용. 새 페이지를 만들거나 컴포넌트를 추가/수정할 때, 또는 프론트엔드 로직을 구현할 때 이 스킬을 반드시 참고할 것.'
---

# 프론트엔드 개발 가이드

Next.js 16 App Router 기반. 서버 컴포넌트 우선, 필요 시에만 클라이언트 컴포넌트 사용.

## App Router 구조

```
app/
├── layout.tsx              # Root Layout (폰트 로딩, Providers)
├── globals.css             # Tailwind + 커스텀 CSS
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── reset-password/page.tsx
├── (main)/
│   ├── layout.tsx          # 사용자 공통 레이아웃 (Header + BottomNav)
│   ├── page.tsx            # 홈
│   ├── gallery/page.tsx
│   ├── reviews/
│   │   ├── page.tsx        # 후기 목록
│   │   ├── [id]/page.tsx   # 후기 상세
│   │   └── write/page.tsx  # 후기 작성 (protected)
│   ├── events/
│   ├── reservation/
│   ├── inquiry/
│   ├── price/page.tsx
│   ├── location/page.tsx
│   └── mypage/page.tsx     # (protected)
├── admin/
│   ├── layout.tsx          # 관리자 레이아웃 (Sidebar)
│   ├── page.tsx            # 대시보드
│   ├── reservations/
│   ├── services/
│   ├── gallery/
│   ├── reviews/
│   ├── events/
│   ├── inquiries/
│   ├── shop/
│   ├── time-slots/
│   └── members/
└── api/                    # API Routes (필요 시)
    └── telegram/route.ts
```

## 서버 vs 클라이언트 컴포넌트

**서버 컴포넌트 (기본):**

- 데이터 fetch가 필요한 페이지 컴포넌트
- SEO가 중요한 콘텐츠 (갤러리, 가격표, 매장 위치)
- 정적 UI 요소

**클라이언트 컴포넌트 (`'use client'`):**

- 사용자 인터랙션 (폼, 캘린더, 슬라이더, 탭)
- 브라우저 API 사용 (localStorage, geolocation)
- 상태 관리가 필요한 컴포넌트
- 이벤트 핸들러가 있는 컴포넌트

```tsx
// 패턴: 서버 컴포넌트에서 fetch → 클라이언트 컴포넌트로 props 전달
// app/(main)/reviews/page.tsx (서버)
import { getReviews } from '@/lib/actions/review';
import { ReviewList } from '@/components/domain/review/ReviewList';

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewList initialData={reviews} />;
}

// components/domain/review/ReviewList.tsx (클라이언트)
('use client');
export function ReviewList({ initialData }: Props) {
  // 클라이언트 상태, 무한스크롤 등
}
```

## 컴포넌트 구조

```
components/
├── ui/                  # shadcn/ui (범용, 도메인 무관)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Calendar.tsx
│   └── ...
├── layout/              # 레이아웃 전용
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BottomNav.tsx
│   ├── AdminSidebar.tsx
│   └── MobileMenu.tsx
└── domain/              # 도메인별 컴포넌트 (DDD)
    ├── reservation/
    │   ├── ReservationCalendar.tsx
    │   ├── TimeSlotPicker.tsx
    │   ├── ServiceSelector.tsx
    │   └── ReservationForm.tsx
    ├── review/
    │   ├── ReviewCard.tsx
    │   ├── ReviewList.tsx
    │   └── ReviewForm.tsx
    ├── gallery/
    │   ├── BeforeAfterSlider.tsx
    │   └── GalleryGrid.tsx
    ├── event/
    │   ├── EventCard.tsx
    │   └── EventBadge.tsx
    └── inquiry/
        ├── InquiryForm.tsx
        └── PasswordVerifyModal.tsx
```

## 상태관리

### Zustand 스토어

전역 상태는 도메인별로 분리하여 관리한다:

```
stores/
├── useAuthStore.ts        # 인증 상태 (user, session)
├── useReservationStore.ts # 예약 폼 상태 (selectedDate, selectedSlot 등)
└── useAdminStore.ts       # 관리자 필터/정렬 상태
```

```typescript
// 패턴: Zustand 스토어
import { create } from 'zustand';

interface ReservationState {
  selectedDate: Date | null;
  selectedSlot: string | null;
  selectedServiceId: string | null;
  setDate: (date: Date) => void;
  setSlot: (slot: string) => void;
  setService: (id: string) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedDate: null,
  selectedSlot: null,
  selectedServiceId: null,
  setDate: (date) => set({ selectedDate: date }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setService: (id) => set({ selectedServiceId: id }),
  reset: () => set({ selectedDate: null, selectedSlot: null, selectedServiceId: null }),
}));
```

### 폼 처리 (React Hook Form + Zod)

```typescript
// 패턴: Zod 스키마 → React Hook Form
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const reviewSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(50, '50자 이내'),
  content: z.string().min(10, '10자 이상 작성하세요').max(2000),
  images: z.array(z.instanceof(File)).max(5, '최대 5장'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;
```

## 미들웨어

`middleware.ts`에서 인증 및 권한을 검증한다:

```typescript
// 보호 경로 정의
const protectedRoutes = ['/reservation', '/reviews/write', '/mypage'];
const adminRoutes = ['/admin'];

// 미인증 → /auth/login 리다이렉트 (returnUrl 포함)
// 비관리자 → /admin 접근 시 / 리다이렉트
```

## 이미지 최적화

- 갤러리/후기 이미지: 클라이언트에서 리사이즈 후 업로드
  - 원본: max 1200px
  - 썸네일: 400px
  - WebP 변환 (browser-image-compression 사용)
- Next.js `<Image>` 사용 (외부 URL은 `next.config.js` domains 설정)
- Supabase Storage CDN URL 사용

## SEO

```tsx
// 패턴: 각 페이지의 metadata export
export const metadata: Metadata = {
  title: '시술 후기 | Needs Ann Brow',
  description: '속눈썹 연장, 반영구 시술 후기를 확인하세요.',
  openGraph: { ... },
};
```

## 상세 레퍼런스

- 페이지별 상세 명세: `references/page-specs.md`
- 컴포넌트 인터페이스 정의: `references/component-interfaces.md`
