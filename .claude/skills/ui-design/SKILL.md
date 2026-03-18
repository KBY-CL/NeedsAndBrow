---
name: ui-design
description: 'Beauty Lash & Brow 프로젝트의 UI 디자인 시스템. 컴포넌트 스타일링, 색상, 타이포그래피, 레이아웃, 반응형 디자인, 애니메이션 작업 시 반드시 참고. 새 컴포넌트 생성, 기존 컴포넌트 수정, 페이지 레이아웃, 모바일 UI, 디자인 토큰, 아이콘, 간격, 그림자 등 시각적 요소를 다루는 모든 작업에서 이 스킬을 사용할 것.'
---

# UI 디자인 시스템

Beauty Lash & Brow의 모든 시각적 요소는 이 디자인 시스템을 따른다.
"Refined Elegance" — 과하지 않으면서도 고급스러운 뷰티 살롱 느낌.

## 디자인 토큰

### 컬러 팔레트

Tailwind CSS `tailwind.config.ts`에 다음 커스텀 컬러를 정의한다:

```typescript
colors: {
  cream:      { DEFAULT: '#FAF6F1', dark: '#F5F0EB' },
  gold:       { light: '#E8D5B7', DEFAULT: '#C9A87C', dark: '#A6835A' },
  rose:       { light: '#F0DEDE', soft: '#F5E8E8', DEFAULT: '#D4A0A0' },
  charcoal:   { DEFAULT: '#2E2E2E', light: '#444444' },
  gray:       { DEFAULT: '#888888', light: '#E8E3DD' },
}
```

**사용 원칙:**

- 배경: `cream` 또는 `white` (교차 사용으로 섹션 구분)
- 포인트/CTA: `gold` 계열
- 보조 강조: `rose` 계열 (호버, 배지 등)
- 텍스트: `charcoal`(제목), `charcoal-light`(본문), `gray`(보조)
- 상태 컬러: 성공 `#4CAF50`, 경고 `#FFC107`, 에러 `#F44336`, 정보 `#3182CE`

### 타이포그래피

세 가지 폰트 시스템을 사용한다:

| 용도            | 폰트                   | Tailwind 클래스 |
| --------------- | ---------------------- | --------------- |
| 디스플레이/제목 | Playfair Display       | `font-display`  |
| 본문/설명       | Cormorant Garamond     | `font-body`     |
| UI/인터페이스   | DM Sans + Noto Sans KR | `font-ui`       |

```typescript
// tailwind.config.ts
fontFamily: {
  display: ['Playfair Display', 'Georgia', 'serif'],
  body:    ['Cormorant Garamond', 'Georgia', 'serif'],
  ui:      ['DM Sans', 'Noto Sans KR', 'sans-serif'],
}
```

**폰트 사용 규칙:**

- 페이지 타이틀, 히어로: `font-display` (세리프, 고급감)
- 긴 본문, 설명 텍스트: `font-body` (우아한 가독성)
- 버튼, 네비, 폼, 라벨: `font-ui` (깔끔한 산세리프)
- 한글 본문이 주가 되는 곳: `font-ui` (Noto Sans KR 자동 적용)

### 폰트 크기 체계

```
text-xs:   11px  — 캡션, 날짜, 보조 정보
text-sm:   13px  — 라벨, 작은 버튼
text-base: 15px  — 본문 기본
text-lg:   18px  — 소제목
text-xl:   22px  — 섹션 제목
text-2xl:  28px  — 페이지 제목
text-3xl:  36px  — 히어로 타이틀 (모바일)
text-4xl:  48px  — 히어로 타이틀 (데스크탑)
```

### 간격 체계 (Spacing)

8px 기반 간격 시스템을 사용한다:

```
gap-1: 4px   — 아이콘과 텍스트 사이
gap-2: 8px   — 관련 요소 간 최소 간격
gap-3: 12px  — 카드 내부 요소 간격
gap-4: 16px  — 컴포넌트 내부 패딩
gap-5: 20px  — 섹션 내 블록 간격
gap-6: 24px  — 카드 간 간격
gap-8: 32px  — 섹션 제목과 컨텐츠 간격
gap-10: 40px — 섹션 간 간격 (모바일)
gap-16: 64px — 섹션 간 간격 (데스크탑)
gap-20: 80px — 대형 섹션 간 간격
```

### 그림자 체계

```css
shadow-soft:    0 2px 8px rgba(0,0,0,0.04)   /* 카드 기본 */
shadow-card:    0 4px 20px rgba(0,0,0,0.06)   /* 카드 호버 */
shadow-modal:   0 20px 60px rgba(0,0,0,0.1)   /* 모달/바텀시트 */
shadow-gold:    0 4px 20px rgba(201,168,124,0.3) /* 골드 버튼 호버 */
```

### 라운딩 (Border Radius)

```
rounded:     4px   — 작은 버튼, 입력 필드
rounded-lg:  8px   — 일반 카드
rounded-xl:  12px  — 큰 카드, 모달
rounded-2xl: 16px  — 이미지 컨테이너, 바텀시트
rounded-full: 50%  — 아바타, 태그
```

## 반응형 브레이크포인트

모바일 퍼스트로 설계한다. 기본 스타일이 모바일이고 위로 확장한다.

```
기본 (0~):     모바일 (375px 기준 설계)
sm (640px~):   태블릿 세로
md (768px~):   태블릿 가로
lg (1024px~):  데스크탑
xl (1280px~):  와이드 데스크탑
```

**레이아웃 규칙:**

- 컨텐츠 최대 너비: `max-w-screen-lg` (1024px)
- 컨테이너 패딩: 모바일 `px-5`, 데스크탑 `px-8`
- 그리드: 모바일 1열 → 태블릿 2열 → 데스크탑 3열

## 컴포넌트 패턴

### 버튼 체계

```
btn-primary:  배경 charcoal, 텍스트 white (주요 액션)
btn-gold:     배경 gold gradient, 텍스트 white (예약/CTA)
btn-outline:  테두리 charcoal, 텍스트 charcoal (보조 액션)
btn-ghost:    배경 투명, 텍스트 gray (취소/닫기)
```

모든 버튼: `font-ui`, 대문자 letter-spacing, 최소 높이 44px (터치 타겟).

### 카드 패턴

```tsx
// 기본 카드 구조
<div className="border-gray-light shadow-soft hover:shadow-card overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1">
  {/* 썸네일 영역 */}
  <div className="bg-cream aspect-[4/3]" />
  {/* 컨텐츠 영역 */}
  <div className="p-4 md:p-5">
    <h3 className="font-ui text-charcoal text-base font-semibold" />
    <p className="font-ui text-gray mt-1 text-sm" />
  </div>
</div>
```

### 배지 패턴

```
badge-event:   bg-red-500, text-white, 깜박임 애니메이션 (진행중 이벤트)
badge-official: bg-gold, text-white (관리자 공식 후기)
badge-status:  각 상태별 색상 (예약확인중/예약됨/마감/취소)
```

### 입력 필드 패턴

```tsx
<input className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-1" />
```

## 애니메이션

- **페이지 진입**: `fadeUp` (opacity 0→1, translateY 30→0, 0.6s ease-out)
- **카드 호버**: `translateY(-4px)` + `shadow-card` (0.3s ease)
- **버튼 호버**: 골드 shimmer 이펙트 (gradient sweep)
- **이벤트 배지**: `pulse` 애니메이션 (opacity 깜박임, 2s infinite)
- **스크롤 인디케이터**: `float` (translateY 위아래 6px, 3s infinite)
- **텍스처**: grain overlay (미세한 노이즈 텍스처, pointer-events: none)

CSS 전용 애니메이션 우선. 라이브러리가 필요한 경우 `framer-motion` 사용.

## 접근성

- 모든 인터랙티브 요소: 최소 44x44px 터치 타겟
- 색상 대비: WCAG AA 기준 충족
- 이미지: alt 텍스트 필수
- 폼 필드: label 연결 필수
- 포커스 스타일: `focus:ring-2 focus:ring-gold/50` 적용

## 아이콘

lucide-react 사용. 사이즈: 기본 20px, 작은 영역 16px, 큰 영역 24px.
stroke-width: 1.5 (기본).

## 상세 레퍼런스

- 전체 디자인 명세: `references/design-tokens.md`
- 컴포넌트 예시 코드: `references/component-examples.md`
