---
name: infrastructure
description: 'Beauty Lash & Brow 인프라 및 배포 가이드. Vercel 배포, Supabase 프로젝트 설정, 환경변수 관리, CI/CD, 도메인 연결, 모니터링 작업 시 사용. 배포 설정, 환경변수 추가, GitHub Actions, Vercel 설정, Supabase 프로젝트 관리 등 인프라 관련 작업에서 이 스킬을 참고할 것.'
---

# 인프라 및 배포 가이드

## 환경 구성

```
개발 (Local)  →  스테이징 (Vercel Preview)  →  운영 (Vercel Production)
Supabase Local    Supabase Project              Supabase Project (동일)
```

## 환경변수

### `.env.local` (로컬 개발용, 커밋 금지)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<로컬 anon key>
SUPABASE_SERVICE_ROLE_KEY=<로컬 service role key>

# Telegram
TELEGRAM_BOT_TOKEN=<봇 토큰>
TELEGRAM_ADMIN_CHAT_ID=<관리자 채팅 ID>

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_KEY=<카카오맵 JS 키>

# OAuth Providers (Supabase Dashboard에서 설정)
# 카카오, 네이버, 구글은 Supabase Auth에서 관리
```

### Vercel 환경변수 (운영)

Vercel Dashboard > Settings > Environment Variables에 설정:

```
NEXT_PUBLIC_SUPABASE_URL       → Production + Preview
NEXT_PUBLIC_SUPABASE_ANON_KEY  → Production + Preview
SUPABASE_SERVICE_ROLE_KEY      → Production only (Sensitive)
TELEGRAM_BOT_TOKEN             → Production only (Sensitive)
TELEGRAM_ADMIN_CHAT_ID         → Production only
NEXT_PUBLIC_KAKAO_MAP_KEY      → Production + Preview
```

`SUPABASE_SERVICE_ROLE_KEY`는 반드시 서버사이드에서만 사용. 클라이언트 노출 금지.

## Vercel 배포

### 초기 설정

```bash
# 1. Vercel CLI 설치
pnpm add -g vercel

# 2. 프로젝트 연결
vercel link

# 3. 환경변수 설정 (또는 Dashboard에서)
vercel env add NEXT_PUBLIC_SUPABASE_URL
```

### `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "regions": ["icn1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

`regions: ["icn1"]`은 서울 리전. 한국 사용자 대상이므로 서울 리전 고정.

### 자동 배포 플로우

```
GitHub Push → Vercel 자동 감지 → 빌드 → 배포
  main 브랜치     → Production 배포
  그 외 브랜치    → Preview 배포 (PR별 URL 생성)
```

## Supabase 프로젝트 설정

### OAuth Provider 설정 (Supabase Dashboard)

Authentication > Providers 에서 각각 활성화:

**카카오:**

1. Kakao Developers에서 앱 생성
2. REST API 키 + Client Secret 발급
3. Redirect URI: `https://<supabase-project>.supabase.co/auth/v1/callback`

**네이버:**

1. Naver Developers에서 앱 등록
2. Client ID + Client Secret 발급
3. 서비스 URL과 Callback URL 설정

**구글:**

1. Google Cloud Console에서 OAuth 2.0 설정
2. Client ID + Client Secret 발급

### Edge Functions 배포

```bash
# 함수 생성
supabase functions new send-telegram

# 로컬 테스트
supabase functions serve send-telegram --env-file .env.local

# 배포
supabase functions deploy send-telegram

# 시크릿 설정
supabase secrets set TELEGRAM_BOT_TOKEN=<토큰>
supabase secrets set TELEGRAM_ADMIN_CHAT_ID=<채팅ID>
```

### Database Webhooks (알림 트리거)

Supabase Dashboard > Database > Webhooks:

- `reservations` 테이블 INSERT → Edge Function `send-telegram` 호출
- `inquiries` 테이블 INSERT → Edge Function `send-telegram` 호출

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
```

## 도메인 연결

1. Vercel Dashboard > Domains > 커스텀 도메인 추가
2. DNS 레코드 설정 (CNAME → `cname.vercel-dns.com`)
3. HTTPS 자동 발급 (Let's Encrypt)

## 모니터링

- **Vercel Analytics**: 무료 웹 분석 (페이지뷰, Core Web Vitals)
- **Vercel Logs**: 서버사이드 로그 확인
- **Supabase Dashboard**: DB 사용량, API 요청 모니터링
- **에러 추적**: 추후 Sentry 무료 플랜 연동 고려

## 보안 체크리스트

- [ ] 환경변수에 시크릿 키 노출 없는지 확인
- [ ] RLS 정책이 모든 테이블에 활성화되었는지 확인
- [ ] CORS 설정이 올바른지 확인
- [ ] CSP(Content Security Policy) 헤더 적용
- [ ] Rate Limiting 적용 (API Routes)
- [ ] 이미지 업로드 파일 타입/사이즈 검증

## 상세 레퍼런스

- OAuth 설정 상세 가이드: `references/oauth-setup.md`
- Supabase 로컬 개발 가이드: `references/supabase-local.md`
