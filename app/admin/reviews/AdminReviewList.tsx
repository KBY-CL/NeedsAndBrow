'use client';

import { Award, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleOfficialReview, deleteReview } from '@/lib/actions/review';
import type { Review } from '@/types/database.types';

type ReviewRow = Review & { profile: { name: string; avatar_url: string | null } | null };

export function AdminReviewList({ initialReviews }: { initialReviews: ReviewRow[] }) {
  const handleToggleOfficial = async (id: string, current: boolean) => {
    await toggleOfficialReview(id, !current);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 후기를 삭제하시겠습니까?')) return;
    await deleteReview(id);
  };

  return (
    <div className="space-y-2">
      {initialReviews.map((review) => (
        <div
          key={review.id}
          className="border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-ui text-charcoal truncate text-sm font-semibold">
                {review.title}
              </span>
              {review.is_official && (
                <span className="bg-gold/20 text-gold-dark rounded-full px-2 py-0.5 text-[10px] font-medium">
                  공식
                </span>
              )}
            </div>
            <p className="font-ui text-gray mt-1 text-xs">
              {review.profile?.name ?? '익명'} &middot;{' '}
              {new Date(review.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div className="ml-3 flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => handleToggleOfficial(review.id, review.is_official)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                review.is_official
                  ? 'bg-gold/20 text-gold-dark'
                  : 'bg-gray-light text-gray hover:bg-gold/10',
              )}
              title={review.is_official ? '공식 해제' : '공식 지정'}
            >
              <Award size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(review.id)}
              className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg"
              title="삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      {initialReviews.length === 0 && (
        <p className="font-ui text-gray py-8 text-center text-sm">등록된 후기가 없습니다.</p>
      )}
    </div>
  );
}
