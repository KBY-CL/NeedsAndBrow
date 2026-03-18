'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createInquiry } from '@/lib/actions/inquiry';

export default function WriteInquiryPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createInquiry, null);

  useEffect(() => {
    if (state?.success) {
      router.push('/inquiry');
    }
  }, [state?.success, router]);

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <h1 className="font-display text-charcoal mb-6 text-2xl">상담 문의</h1>

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="title" className="font-ui text-charcoal mb-2 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={100}
            placeholder="문의 제목을 입력하세요"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
          />
        </div>

        <div>
          <label htmlFor="content" className="font-ui text-charcoal mb-2 block text-sm font-medium">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            maxLength={2000}
            placeholder="문의 내용을 입력하세요"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="font-ui text-charcoal mb-2 block text-sm font-medium"
          >
            비밀번호 (선택)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={4}
            maxLength={20}
            placeholder="비공개 문의 시 비밀번호를 설정하세요"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
          />
          <p className="font-ui text-gray mt-1 text-xs">
            비밀번호를 설정하면 비밀번호 입력 후에만 내용을 확인할 수 있습니다.
          </p>
        </div>

        {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="font-ui bg-gold hover:bg-gold-dark flex h-12 w-full items-center justify-center rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '등록 중...' : '문의 등록'}
        </button>
      </form>
    </div>
  );
}
