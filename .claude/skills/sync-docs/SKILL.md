---
name: sync-docs
description: 'CLAUDE.md와 .claude/skills/ 문서를 실제 코드베이스 상태와 동기화한다. 구현 작업 완료 후, Phase 단계 완료 후, 또는 의존성/설정 변경 후 실행. 실제 구현과 문서 간 불일치를 탐지하고 자동 수정한다.'
---

# 문서 동기화 스킬

구현이 완료되었을 때 이 스킬을 실행하여 CLAUDE.md와 스킬 파일들이 실제 코드베이스와 일치하는지 확인하고 업데이트한다.

---

## 실행 절차

### Step 1 — 실제 상태 수집 (Read-only)

다음 파일들을 읽어 현재 프로젝트 상태를 파악한다:

```
package.json          → 실제 의존성 버전
tsconfig.json         → TypeScript 설정
eslint.config.mjs     → ESLint 설정 방식
app/globals.css       → Tailwind 토큰 (v3/v4 여부)
middleware.ts         → 보호 경로 목록
.env.local            → 환경변수 키 목록 (값은 기록하지 않음)
vercel.json           → 배포 설정
.husky/pre-commit     → 훅 내용
```

### Step 2 — 문서와 비교

읽은 내용을 아래 문서들과 대조한다:

| 문서                          | 확인 항목                                          |
| ----------------------------- | -------------------------------------------------- |
| `CLAUDE.md`                   | 기술 스택 버전, 프로젝트 구조, 핵심 명령어         |
| `dev-environment/SKILL.md`    | 의존성 버전, ESLint 형식, TypeScript 경로, 훅 설정 |
| `project-management/SKILL.md` | Phase 완료 여부 (☑ 표시)                           |
| `infrastructure/SKILL.md`     | CI/CD 버전, 환경변수 목록, vercel.json             |
| `frontend/SKILL.md`           | 라우팅 구조, 상태관리 패턴                         |
| `backend/SKILL.md`            | Supabase 클라이언트 패턴, Server Actions 구조      |
| `database/SKILL.md`           | 실제 마이그레이션 파일과 스키마 설명 일치 여부     |

### Step 3 — 불일치 목록 작성

비교 결과를 아래 형식으로 정리한다:

```
[불일치 발견]
파일: dev-environment/SKILL.md
항목: zustand 버전
문서: ^4.x
실제: ^5.0.12
→ 수정 필요

[일치]
파일: infrastructure/SKILL.md
항목: regions
문서: icn1
실제: icn1
→ 변경 없음
```

### Step 4 — 업데이트 실행

불일치 항목에 대해서만 Edit 도구로 수정한다. 일치하는 항목은 건드리지 않는다.

### Step 5 — 검증 및 커밋

```bash
# 변경된 문서 파일만 커밋
git add CLAUDE.md .claude/skills/
git commit -m "docs: sync documentation with current implementation state"
```

---

## 트리거 시점

이 스킬을 실행해야 하는 상황:

- ✅ Phase 단계 완료 직후 (1-1, 1-2, ...)
- ✅ 패키지 추가/삭제/버전 업그레이드 후
- ✅ 설정 파일 변경 후 (tsconfig, eslint, tailwind)
- ✅ 폴더 구조 변경 후
- ✅ 환경변수 추가 후
- ✅ middleware.ts 보호 경로 변경 후

---

## 업데이트 우선순위

| 우선순위 | 항목                   | 이유                                 |
| -------- | ---------------------- | ------------------------------------ |
| 높음     | 의존성 버전            | 잘못된 버전으로 설치하면 호환성 문제 |
| 높음     | Phase 완료 표시        | 다음 작업 결정에 영향                |
| 높음     | 환경변수 목록          | 새 개발자 온보딩 시 필요             |
| 중간     | TypeScript/ESLint 설정 | 개발 경험에 영향                     |
| 중간     | 폴더 구조              | 파일 위치 파악에 영향                |
| 낮음     | 명령어 설명            | 기능에는 영향 없음                   |

---

## 주의사항

- `.env.local`의 실제 **값(키)** 은 절대 문서에 기록하지 않는다 (키 이름만 기록)
- 문서에 없는 새로운 패턴이 코드에 등장했다면 해당 SKILL.md에 섹션을 추가한다
- CLAUDE.md의 "중요 원칙" 섹션은 코드 상태와 무관하므로 건드리지 않는다
