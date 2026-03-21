---
name: dev-environment
description: 'Needs Ann Brow 개발 환경 설정 가이드. 프로젝트 초기 셋업, Node.js/pnpm 설치, 의존성 관리, Supabase 로컬 환경, ESLint/Prettier, IDE 설정, Git hooks 구성 등 개발 환경을 구축하거나 수정할 때 사용. 새 개발자 온보딩, 의존성 추가/변경, 로컬 개발 환경 문제 해결 시 이 스킬을 참고할 것.'
---

# 개발 환경 설정 가이드

## 필수 요구사항

```
Node.js:    20.x LTS 이상
pnpm:       10.x 이상
Docker:     Supabase 로컬 실행용 (WSL2 백엔드 권장)
Git:        2.x 이상
```

## 프로젝트 초기 셋업

```bash
# 1. 레포 클론
git clone https://github.com/KBY-CL/NeedsAndBrow.git
cd NeedsAndBrow

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정 (.env.local 직접 생성)
# 아래 환경변수 섹션 참고

# 4. Supabase 로컬 실행 (Docker 필요)
supabase start
# 출력되는 API URL, anon key, service_role key를 .env.local에 입력

# 5. DB 마이그레이션 적용
supabase db reset

# 6. 개발 서버 실행
pnpm dev
```

## .env.local 템플릿

```env
# Supabase (로컬 개발 시 supabase start 출력값 사용)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<로컬 anon key>
SUPABASE_SERVICE_ROLE_KEY=<로컬 service role key>

# 운영 Supabase (배포 시 Vercel 환경변수로 설정)
# NEXT_PUBLIC_SUPABASE_URL=https://coonepcwnxatbazmtsrc.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Dashboard > API > Publishable key>

# Telegram (Phase 3-3에서 설정)
TELEGRAM_BOT_TOKEN=<봇 토큰>
TELEGRAM_ADMIN_CHAT_ID=<관리자 채팅 ID>

# Kakao Map (Phase 3-2에서 설정)
NEXT_PUBLIC_KAKAO_MAP_KEY=<카카오맵 JS 키>
```

## 실제 설치된 의존성 버전

### Core

```json
{
  "next": "16.1.7",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "typescript": "^5"
}
```

### Supabase

```json
{
  "@supabase/supabase-js": "^2",
  "@supabase/ssr": "^0.9"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^4",
  "tailwind-merge": "^3",
  "clsx": "^2",
  "class-variance-authority": "^0.7",
  "lucide-react": "^0.5",
  "radix-ui": "^1",
  "shadcn": "^4",
  "tw-animate-css": "^1"
}
```

> ⚠️ **Tailwind v4 주의**: `tailwind.config.js` 파일이 없다. 모든 커스텀 토큰은 `app/globals.css`의 `@theme` 블록에서 CSS 변수로 정의한다.

### 폼 & 검증

```json
{
  "react-hook-form": "^7",
  "@hookform/resolvers": "^5",
  "zod": "^4"
}
```

### 상태관리 & 유틸

```json
{
  "zustand": "^5",
  "date-fns": "^4",
  "react-day-picker": "^9",
  "browser-image-compression": "^2"
}
```

### 개발 도구

```json
{
  "eslint": "^9",
  "eslint-config-next": "16.1.7",
  "prettier": "^3",
  "prettier-plugin-tailwindcss": "^0.7",
  "@typescript-eslint/eslint-plugin": "^8",
  "@typescript-eslint/parser": "^8",
  "@types/node": "^20",
  "@types/react": "^19",
  "vitest": "^4",
  "@vitejs/plugin-react": "^6",
  "@testing-library/react": "^16",
  "@testing-library/jest-dom": "^6",
  "@testing-library/user-event": "^14",
  "jsdom": "^29",
  "husky": "^9",
  "lint-staged": "^16"
}
```

## ESLint 설정

ESLint v9 **Flat Config** 방식 사용 (`.eslintrc.js` 아님).

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);
```

## Prettier 설정

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

## TypeScript 설정

```json
// tsconfig.json 주요 설정
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

`@/` 경로 별칭은 프로젝트 루트 기준 (`src/` 없음).

## package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:types": "supabase gen types typescript --local > types/database.types.ts",
    "prepare": "husky"
  }
}
```

## Supabase 타입 자동 생성

DB 스키마 변경 후 TypeScript 타입을 자동 생성한다 (Supabase 로컬 실행 필요):

```bash
pnpm db:types
```

이 명령은 `types/database.types.ts`를 생성한다.
현재는 placeholder (`export type Database = Record<string, unknown>`)가 들어있고,
Phase 1-2 마이그레이션 후 이 명령으로 실제 타입을 생성한다.

```typescript
import { Database } from '@/types/database.types';
type Review = Database['public']['Tables']['reviews']['Row'];
```

## Git Hooks (husky v9 + lint-staged)

```bash
# husky 초기화 (prepare 스크립트로 자동 실행)
pnpm prepare

# .husky/pre-commit 내용
pnpm typecheck && pnpm lint-staged
```

```json
// package.json lint-staged 설정
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## Tailwind v4 디자인 토큰 위치

Tailwind v4는 `tailwind.config.js` 없이 CSS에서 직접 설정한다.

```css
/* app/globals.css */
@theme {
  --color-gold: #c9a87c;
  --font-display: var(--font-playfair, 'Playfair Display', serif);
  /* ... */
}
```

컴포넌트에서 `bg-gold`, `text-charcoal`, `font-display` 등으로 사용.

## VS Code 권장 설정

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [["cn\\(([^)]*)\\)", "\"([^\"]*)\""]]
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```
