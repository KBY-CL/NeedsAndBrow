import type { Metadata } from 'next';
import { AdminReviewList } from './AdminReviewList';
import { getReviews } from '@/lib/actions/review';

export const metadata: Metadata = { title: '후기 관리' };

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">후기 관리</h1>
      <AdminReviewList initialReviews={reviews} />
    </div>
  );
}
