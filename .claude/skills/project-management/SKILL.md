---
name: project-management
description: 'Needs Ann Brow 프로젝트 관리 가이드. 구현 순서(Phase), 작업 분해, 체크리스트, 코드 리뷰 기준, 릴리스 프로세스 관리 시 사용. 새 기능 구현 시 우선순위 확인, Phase별 진행 상황 확인, 다음 작업 결정 등 프로젝트 진행 관련 작업에서 이 스킬을 참고할 것.'
---

# 프로젝트 관리 가이드

## Phase 별 구현 로드맵

### Phase 1 — MVP (핵심 기능) / 3-4주

기초 인프라와 핵심 사용자 여정을 구현한다.

```
☑ 1-1. 프로젝트 초기 셋업 【완료】
   - Next.js 16 + React 19 프로젝트 생성
   - Tailwind CSS v4 + shadcn/ui (Radix) 설정
   - Supabase 프로젝트 연결 (.env.local)
   - 디자인 토큰 설정 (app/globals.css @theme 블록 — Tailwind v4 방식)
   - 폰트 로딩: Playfair Display, Cormorant Garamond, DM Sans, Noto Sans KR
   - 폴더 구조 생성 (.gitkeep)
   - ESLint Flat Config, Prettier, TypeScript strict 강화
   - vitest + testing-library 설정
   - husky pre-commit 훅 (typecheck + lint-staged)
   - Supabase 클라이언트 3종 (browser/server/admin)
   - middleware.ts (보호 경로 인증)
   - vercel.json (icn1 서울 리전)
   - GitHub main 브랜치 push 완료

✅ 1-2. DB 스키마 + RLS
   - 전체 테이블 마이그레이션 작성
   - RLS 정책 적용
   - Storage 버킷 설정
   - 시드 데이터 입력
   - Supabase 타입 자동 생성

✅ 1-3. 인증 시스템
   - Supabase Auth 설정 (카카오/네이버/구글 OAuth)
   - 핸드폰번호 회원가입 (OTP)
   - 로그인/로그아웃
   - 비밀번호 찾기 (핸드폰 인증)
   - JWT + Middleware 설정
   - profiles 자동 생성 트리거

✅ 1-4. 공통 레이아웃
   - Header (로고, 알림, 프로필, 햄버거)
   - BottomNav (모바일 하단 네비)
   - Footer
   - 관리자 Sidebar
   - 반응형 기본 레이아웃

✅ 1-5. 예약 시스템
   - 캘린더 UI (날짜 선택)
   - 시간 슬롯 선택
   - 서비스 선택
   - 예약 문의 제출
   - 예약 상태 관리 (pending/confirmed/rejected/cancelled)
   - 예약 취소 (2시간 전 규칙)
   - 내 예약 현황 페이지

✅ 1-6. 관리자 — 예약 관리
   - 대시보드 기본
   - 예약 목록 (날짜별)
   - 예약 확정/불가 처리
   - 예약마감일 지정
   - 시간 슬롯 설정
   - 서비스 CRUD
```

### Phase 2 — 콘텐츠 / 2-3주

```
✅ 2-1. Before & After 갤러리
   - 관리자: 전/후 사진 쌍 업로드
   - 카테고리 분류
   - 사용자: 카테고리 필터 + 슬라이더 UI
   - 이미지 리사이즈/WebP 최적화

✅ 2-2. 시술후기 게시판
   - 후기 목록 (카드 형태, 썸네일+제목)
   - 후기 상세 페이지
   - 후기 작성 (제목+본문+이미지 최대 5장)
   - 관리자 공식 후기 배지
   - 본인 글 수정/삭제

✅ 2-3. 이벤트 게시판
   - 이벤트 목록 (상태 배지 표시)
   - 이벤트 상세 (본문 + CTA)
   - 관리자: 이벤트 CRUD + 기간 설정
   - 상태 자동 계산 (예정/진행중/종료)

✅ 2-4. 시술 가격표
   - 카테고리별 가격 목록
   - 이벤트 할인 가격 연동
   - 예약 페이지 연결 버튼
```

### Phase 3 — 부가 기능 / 1-2주

```
✅ 3-1. 상담문의 게시판
   - 문의 작성 (비밀번호 잠금)
   - 목록 (제목+날짜+답변상태)
   - 비밀번호 확인 후 상세 보기
   - 관리자: 답변 작성

✅ 3-2. 매장 위치
   - 카카오맵 연동
   - 매장 정보 표시 (주소, 전화, 운영시간, 주차)
   - 길찾기 바로가기

✅ 3-3. Telegram 푸시 알림
   - Bot 생성 + 연동
   - 예약/문의 시 관리자 알림
   - DB Webhook → Edge Function → Telegram

✅ 3-4. 회원 관리
   - 마이페이지 (프로필 수정)
   - 회원 탈퇴 (soft delete, 30일 유예)
   - 관리자: 회원 목록/권한 관리
```

### Phase 4 — 최적화 / 1-2주

```
✅ 4-1. 성능 최적화
   - 이미지 lazy loading
   - ISR (Incremental Static Regeneration) 적용
   - 번들 사이즈 분석 + 최적화

✅ 4-2. SEO
   - 각 페이지 metadata 설정
   - sitemap.xml 자동 생성
   - robots.txt
   - OG 이미지 생성

✅ 4-3. 테스트 + QA
   - 도메인 규칙 단위 테스트 (90% 커버리지)
   - 주요 컴포넌트 통합 테스트
   - E2E: 예약 플로우, 인증 플로우
   - 크로스 브라우저 테스트 (Chrome, Safari, Samsung Internet)

✅ 4-4. 추후 확장 준비
   - 카카오 알림톡 전환 준비 (인터페이스 분리)
   - 관리자 통계 대시보드 (추후)
```

## 작업 분해 원칙

하나의 작업은 다음 기준을 따른다:

1. **1 PR = 1 기능** (또는 1 수정)
2. **작업 시간 30분~2시간** 이내
3. **독립적으로 테스트 가능**해야 함
4. **DB 변경이 있으면 마이그레이션 포함**

## 코드 리뷰 체크리스트

```
[ ] TypeScript strict 위반 없음
[ ] any 타입 사용하지 않음
[ ] 도메인 로직이 올바른 레이어에 있음
[ ] RLS 정책이 적용됨
[ ] 에러 케이스가 처리됨
[ ] 모바일에서 테스트됨 (375px)
[ ] 새 기능에 테스트가 포함됨
[ ] 환경변수 노출 없음
```

## 상세 레퍼런스

- 세부 작업 타임라인: `references/timeline.md`
- 릴리스 체크리스트: `references/release-checklist.md`
