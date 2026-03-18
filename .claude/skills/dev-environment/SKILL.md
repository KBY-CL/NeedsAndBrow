---
name: dev-environment
description: 'Beauty Lash & Brow 개발 환경 설정 가이드. 프로젝트 초기 셋업, Node.js/pnpm 설치, 의존성 관리, Supabase 로컬 환경, ESLint/Prettier, IDE 설정, Git hooks 구성 등 개발 환경을 구축하거나 수정할 때 사용. 새 개발자 온보딩, 의존성 추가/변경, 로컬 개발 환경 문제 해결 시 이 스킬을 참고할 것.'
---

# 개발 환경 설정 가이드

## 필수 요구사항

```
Node.js:    20.x LTS 이상
pnpm:       8.x 이상
Docker:     Supabase 로컬 실행용
Git:        2.x 이상
```

## 프로젝트 초기 셋업

```bash
# 1. 레포 클론
git clone https://github.com/<org>/beauty-lash.git
cd beauty-lash

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 편집하여 키 값 채우기

# 4. Supabase 로컬 실행
supabase start
# 출력되는 API URL, anon key, service_role key를 .env.local에 입력

# 5. DB 마이그레이션 적용
supabase db reset

# 6. 개발 서버 실행
pnpm dev
```

## 의존성 목록

### Core

```json
{
  "next": "14.x",
  "react": "18.x",
  "react-dom": "18.x",
  "typescript": "5.x"
}
```

### Supabase

```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x"
}
```

### UI & Styling

```json
{
  "tailwindcss": "^3.x",
  "tailwind-merge": "^2.x",
  "clsx": "^2.x",
  "class-variance-authority": "^0.x",
  "lucide-react": "^0.x",
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^2.x",
  "@radix-ui/react-tabs": "^1.x"
}
```

### 폼 & 검증

```json
{
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x"
}
```

### 상태관리 & 유틸

```json
{
  "zustand": "^4.x",
  "date-fns": "^3.x",
  "react-day-picker": "^8.x",
  "browser-image-compression": "^2.x"
}
```

### 개발 도구

```json
{
  "eslint": "^8.x",
  "eslint-config-next": "14.x",
  "prettier": "^3.x",
  "prettier-plugin-tailwindcss": "^0.x",
  "@types/node": "^20.x",
  "@types/react": "^18.x",
  "vitest": "^1.x",
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "supabase": "^1.x"
}
```

## ESLint 설정

```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/no-unescaped-entities': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
  },
};
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
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

`@/` 경로 별칭을 사용하여 import한다.
`noUncheckedIndexedAccess: true`로 배열/객체 접근 시 undefined 체크를 강제한다.

## package.json scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration new",
    "db:types": "supabase gen types typescript --local > src/types/database.types.ts"
  }
}
```

## Supabase 타입 자동 생성

DB 스키마 변경 후 TypeScript 타입을 자동 생성한다:

```bash
pnpm db:types
```

이 명령은 `src/types/database.types.ts`를 생성한다.
Supabase 클라이언트에서 타입 안전한 쿼리를 위해 사용한다:

```typescript
import { Database } from '@/types/database.types';
type Review = Database['public']['Tables']['reviews']['Row'];
```

## Git Hooks (husky + lint-staged)

```bash
pnpm add -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": "prettier --write"
  }
}
```

## VS Code 권장 설정

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma"
  ]
}
```

## 디렉토리 `.gitignore`

```
node_modules/
.next/
.env.local
.env*.local
.vercel
supabase/.temp/
coverage/
```

## 상세 레퍼런스

- Supabase 로컬 환경 상세: `references/supabase-local-setup.md`
- 트러블슈팅 가이드: `references/troubleshooting.md`
