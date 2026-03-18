'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { sendResetPasswordEmail, updatePassword } from '@/lib/actions/auth';

// ─── 이메일 입력 → 재설정 링크 발송 ─────────────────────────────

export function RequestResetForm() {
  const [state, action, isPending] = useActionState(sendResetPasswordEmail, null);

  if (state?.success) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-4 text-4xl">✉️</div>
        <h2 className="font-display text-charcoal mb-3 text-xl">이메일을 확인하세요</h2>
        <p className="text-gray mb-6 text-sm">
          비밀번호 재설정 링크를 이메일로 보냈습니다.
          <br />
          링크는 1시간 동안 유효합니다.
        </p>
        <Link
          href="/login"
          className="border-gray-light text-charcoal hover:bg-cream-dark block w-full rounded-lg border py-3 text-center text-sm font-medium transition-colors"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-charcoal mb-2 text-center text-2xl">비밀번호 찾기</h1>
      <p className="text-gray mb-8 text-center text-sm">
        가입하신 이메일로 재설정 링크를 보내드립니다.
      </p>

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

        {state && !state.success && <p className="text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-gold hover:bg-gold-dark w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '전송 중...' : '재설정 링크 보내기'}
        </button>
      </form>

      <p className="text-gray mt-6 text-center text-xs">
        <Link href="/login" className="text-gold hover:text-gold-dark transition-colors">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}

// ─── 새 비밀번호 입력 폼 (이메일 링크 클릭 후) ─────────────────

export function UpdatePasswordForm() {
  const [state, action, isPending] = useActionState(updatePassword, null);

  if (state?.success) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-4 text-4xl">✅</div>
        <h2 className="font-display text-charcoal mb-3 text-xl">비밀번호가 변경되었습니다</h2>
        <Link
          href="/login"
          className="bg-gold hover:bg-gold-dark block w-full rounded-lg py-3 text-center text-sm font-medium text-white transition-colors"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-charcoal mb-8 text-center text-2xl">새 비밀번호 설정</h1>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="password" className="text-charcoal-light mb-1 block text-sm">
            새 비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="영문+숫자 8자 이상"
            className="border-gray-light focus:border-gold w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
          />
        </div>

        {state && !state.success && <p className="text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-gold hover:bg-gold-dark w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '변경 중...' : '비밀번호 변경'}
        </button>
      </form>
    </div>
  );
}
