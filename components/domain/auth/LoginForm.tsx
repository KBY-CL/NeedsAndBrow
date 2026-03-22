'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { loginWithEmail, getOAuthUrl } from '@/lib/actions/auth';

export function LoginForm() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/';

  const [state, action, isPending] = useActionState(loginWithEmail, null);

  useEffect(() => {
    if (state?.success) {
      window.location.href = returnUrl;
    }
  }, [state, returnUrl]);

  async function handleOAuth(provider: 'kakao' | 'google') {
    const result = await getOAuthUrl(provider);
    if (result.success) {
      window.location.href = result.data;
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-charcoal mb-8 text-center text-2xl">로그인</h1>

      {/* 이메일/비밀번호 폼 */}
      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-charcoal-light mb-1 block text-sm">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="example@email.com"
            className="border-gray-light focus:border-gold w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-charcoal-light mb-1 block text-sm">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="비밀번호 입력"
            className="border-gray-light focus:border-gold w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
          />
        </div>

        {state && !state.success && <p className="text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-gold hover:bg-gold-dark w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>

      {/* 구분선 */}
      <div className="my-6 flex items-center gap-3">
        <div className="bg-gray-light h-px flex-1" />
        <span className="text-gray text-xs">또는</span>
        <div className="bg-gray-light h-px flex-1" />
      </div>

      {/* OAuth 버튼 */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          className="border-gray-light text-charcoal hover:bg-cream-dark flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors"
        >
          Google로 로그인
        </button>
      </div>

      {/* 링크 */}
      <div className="text-gray mt-6 flex justify-between text-xs">
        <Link href="/reset-password" className="hover:text-charcoal transition-colors">
          비밀번호 찾기
        </Link>
        <Link href="/signup" className="hover:text-charcoal transition-colors">
          회원가입
        </Link>
      </div>
    </div>
  );
}
