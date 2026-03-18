'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupWithEmail } from '@/lib/actions/auth';

export function SignupForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(signupWithEmail, null);

  if (state?.success) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="mb-4 text-4xl">✉️</div>
        <h2 className="font-display text-charcoal mb-3 text-xl">인증 이메일을 확인하세요</h2>
        <p className="text-gray mb-6 text-sm">
          가입하신 이메일로 인증 링크를 보냈습니다.
          <br />
          이메일 인증 후 로그인하실 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="bg-gold hover:bg-gold-dark w-full rounded-lg py-3 text-sm font-medium text-white transition-colors"
        >
          로그인 페이지로
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-charcoal mb-8 text-center text-2xl">회원가입</h1>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-charcoal-light mb-1 block text-sm">
            이름 <span className="text-error">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="홍길동"
            className="border-gray-light focus:border-gold w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-charcoal-light mb-1 block text-sm">
            이메일 <span className="text-error">*</span>
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
            비밀번호 <span className="text-error">*</span>
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

        <div>
          <label htmlFor="phone" className="text-charcoal-light mb-1 block text-sm">
            휴대폰 번호 <span className="text-gray text-xs">(선택)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="01012345678"
            className="border-gray-light focus:border-gold w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors focus:outline-none"
          />
        </div>

        {state && !state.success && <p className="text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-gold hover:bg-gold-dark w-full rounded-lg py-3 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '처리 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-gray mt-6 text-center text-xs">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-gold hover:text-gold-dark transition-colors">
          로그인
        </Link>
      </p>
    </div>
  );
}
