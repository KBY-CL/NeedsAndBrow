import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine, Award } from 'lucide-react';
import { getReviews } from '@/lib/actions/review';

export const metadata: Metadata = {
  title: '시술 후기',
  description: '속눈썹 연장, 반영구 시술 후기',
};

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-charcoal text-2xl">시술 후기</h1>
          <p className="font-ui text-gray mt-1 text-sm">고객님들의 솔직한 후기</p>
        </div>
        <Link
          href="/reviews/write"
          className="font-ui bg-charcoal inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-black"
        >
          <PenLine size={14} strokeWidth={1.5} />
          후기 작성
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="font-ui text-gray py-12 text-center text-sm">아직 작성된 후기가 없습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const profile = review.profile as { name: string; avatar_url: string | null } | null;
            const thumbnail = review.images?.[0];

            return (
              <Link
                key={review.id}
                href={`/reviews/${review.id}`}
                className="border-gray-light shadow-soft hover:shadow-card group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1"
              >
                {thumbnail && (
                  <div className="bg-cream aspect-[4/3] overflow-hidden">
                    <img
                      src={thumbnail}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-ui text-charcoal flex-1 truncate text-sm font-semibold">
                      {review.title}
                    </h3>
                    {review.is_official && (
                      <span className="bg-gold/20 text-gold-dark inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium">
                        <Award size={10} />
                        공식
                      </span>
                    )}
                  </div>
                  <p className="font-ui text-gray mt-1 line-clamp-2 text-xs">{review.content}</p>
                  <div className="font-ui text-gray mt-3 flex items-center justify-between text-xs">
                    <span>{profile?.name ?? '익명'}</span>
                    <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
