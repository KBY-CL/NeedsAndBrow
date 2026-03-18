import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award } from 'lucide-react';
import { getReviewById } from '@/lib/actions/review';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) return { title: '후기를 찾을 수 없습니다' };
  return { title: review.title };
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReviewById(id);
  if (!review) notFound();

  const profile = review.profile as { name: string; avatar_url: string | null } | null;

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <Link
        href="/reviews"
        className="font-ui text-gray mb-6 inline-flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft size={14} />
        목록으로
      </Link>

      <article>
        <div className="mb-4 flex items-center gap-2">
          <h1 className="font-display text-charcoal flex-1 text-2xl">{review.title}</h1>
          {review.is_official && (
            <span className="bg-gold/20 text-gold-dark inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-medium">
              <Award size={12} />
              공식 후기
            </span>
          )}
        </div>

        <div className="font-ui text-gray mb-6 flex items-center gap-3 text-sm">
          <span>{profile?.name ?? '익명'}</span>
          <span>&middot;</span>
          <span>{new Date(review.created_at).toLocaleDateString('ko-KR')}</span>
        </div>

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {review.images.map((url, i) => (
              <div key={i} className="bg-cream overflow-hidden rounded-xl">
                <img
                  src={url}
                  alt={`후기 이미지 ${i + 1}`}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="font-ui text-charcoal-light text-base leading-relaxed whitespace-pre-wrap">
          {review.content}
        </div>
      </article>
    </div>
  );
}
