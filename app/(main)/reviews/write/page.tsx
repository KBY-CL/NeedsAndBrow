'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createReview } from '@/lib/actions/review';

export default function WriteReviewPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createReview, null);

  useEffect(() => {
    if (state?.success) {
      router.push('/reviews');
    }
  }, [state?.success, router]);

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <h1 className="font-display text-charcoal mb-6 text-2xl">후기 작성</h1>

      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="title" className="font-ui text-charcoal mb-2 block text-sm font-medium">
            제목
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={50}
            placeholder="시술 후기 제목을 입력하세요"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-1"
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
            rows={8}
            minLength={10}
            maxLength={2000}
            placeholder="시술 경험을 자세히 공유해 주세요 (최소 10자)"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-1"
          />
        </div>

        <input type="hidden" name="images" value="[]" />

        {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="font-ui bg-gold hover:bg-gold-dark flex h-12 w-full items-center justify-center rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '등록 중...' : '후기 등록'}
        </button>
      </form>
    </div>
  );
}
