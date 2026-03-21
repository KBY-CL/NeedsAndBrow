# Needs Ann Brow — 프로젝트 CLAUDE.md

## 프로젝트 개요

속눈썹 연장 및 반영구 시술 전문 매장을 위한 반응형 웹앱.
모바일 퍼스트 설계, DDD(Domain-Driven Design) 기반 아키텍처.

- **프로젝트명**: needs-ann-brow
- **설계서**: `docs/DESIGN_SPEC.md` — 전체 기능 명세, DB 스키마, 페이지 구조 참고
- **디자인 컨셉**: `docs/DESIGN_CONCEPT.md` — 컬러, 타이포그래피, UI 톤앤매너

## 기술 스택

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **State**: Zustand (전역), React Hook Form + Zod (폼)
- **Push**: Telegram Bot API (→ 추후 카카오 알림톡)
- **Deploy**: Vercel (Free Plan)
- **VCS**: GitHub

## 핵심 명령어

```bash
# 개발 서버
pnpm dev

# 타입 체크
pnpm typecheck

# 린트
pnpm lint

# 단일 테스트
pnpm test -- --testPathPattern=<파일명>

# 전체 테스트
pnpm test

# 빌드
pnpm build

# Supabase 로컬
supabase start
supabase db reset
supabase functions serve
```

## 프로젝트 구조

```
needs-ann-brow/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 인증 페이지 (로그인, 회원가입, 비밀번호찾기)
│   ├── (main)/             # 사용자 페이지 (갤러리, 후기, 예약 등)
│   ├── admin/              # 관리자 페이지
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # shadcn/ui 공통 컴포넌트
│   ├── layout/             # Header, Footer, BottomNav
│   └── domain/             # 도메인별 컴포넌트 (reservation/, review/ 등)
├── lib/
│   ├── supabase/           # Supabase 클라이언트 + 서버 설정
│   ├── actions/            # Server Actions (도메인별)
│   └── utils/              # 유틸리티
├── hooks/                  # 커스텀 React Hooks
├── stores/                 # Zustand 스토어
├── types/                  # TypeScript 타입 정의 (도메인별)
├── supabase/
│   ├── migrations/         # DB 마이그레이션 SQL
│   └── functions/          # Edge Functions
├── __tests__/              # 테스트 파일
└── middleware.ts            # 인증/권한 미들웨어
```

## 코드 컨벤션

- ES Modules(`import/export`) 사용. CommonJS(`require`) 금지
- 컴포넌트는 함수형 + hooks 패턴. 클래스 컴포넌트 금지
- `any` 타입 사용 금지 → `unknown` 또는 구체적 타입 사용
- 서버 컴포넌트 우선, 클라이언트 상태가 필요한 경우에만 `'use client'`
- 파일/폴더명: kebab-case, 컴포넌트 파일명: PascalCase.tsx
- 도메인 로직은 반드시 해당 도메인 디렉토리에 위치
- 환경변수는 `.env.local`에 관리, 절대 커밋하지 않음

## Git 워크플로

- `main` 브랜치 직접 작업 금지
- 브랜치 네이밍: `feat/기능명`, `fix/버그명`, `refactor/대상`
- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- PR 생성 후 머지 (squash merge 권장)

## 스킬 (Skills) — 작업 시 반드시 참고

각 도메인별 상세 가이드는 `.claude/skills/` 에 정리되어 있다.
**새로운 작업을 시작할 때 해당 스킬의 SKILL.md를 먼저 읽고** 지침을 따를 것.

| 스킬             | 경로                                         | 트리거                                                   |
| ---------------- | -------------------------------------------- | -------------------------------------------------------- |
| UI 디자인 시스템 | `.claude/skills/ui-design/SKILL.md`          | 컴포넌트 스타일링, 색상, 타이포, 레이아웃, 반응형 작업   |
| 프론트엔드       | `.claude/skills/frontend/SKILL.md`           | 페이지, 컴포넌트, 라우팅, 상태관리, 폼 처리              |
| 백엔드 (DDD)     | `.claude/skills/backend/SKILL.md`            | API, Server Actions, 비즈니스 로직, Edge Functions       |
| 데이터베이스     | `.claude/skills/database/SKILL.md`           | 스키마, 마이그레이션, RLS, 쿼리 최적화                   |
| 인프라/배포      | `.claude/skills/infrastructure/SKILL.md`     | Vercel, Supabase 설정, 환경변수, CI/CD                   |
| 개발 환경        | `.claude/skills/dev-environment/SKILL.md`    | 프로젝트 초기 셋업, 의존성, 로컬 개발 환경               |
| 테스트           | `.claude/skills/testing/SKILL.md`            | 단위/통합/E2E 테스트 작성                                |
| 프로젝트 관리    | `.claude/skills/project-management/SKILL.md` | 구현 순서, Phase 관리, 체크리스트                        |
| 문서 동기화      | `.claude/skills/sync-docs/SKILL.md`          | Phase 완료 후, 패키지 변경 후 CLAUDE.md·스킬 파일 동기화 |

## 중요 원칙

1. **모바일 퍼스트**: 모든 UI는 375px 기준으로 먼저 설계 후 확장
2. **DDD 준수**: 도메인별 관심사 분리 철저히 유지
3. **보안 우선**: Supabase RLS 정책 + Middleware 이중 검증
4. **점진적 구현**: Phase 1(MVP) → Phase 4(최적화) 순서 준수
5. **타입 안전성**: 모든 데이터 흐름에 TypeScript 타입 적용
