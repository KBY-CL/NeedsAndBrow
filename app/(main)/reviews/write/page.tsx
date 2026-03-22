import { WriteReviewForm } from './WriteReviewForm';

export const dynamic = 'force-dynamic';

export default function WriteReviewPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <h1 className="font-display text-charcoal mb-6 text-2xl">후기 작성</h1>
      <WriteReviewForm />
    </div>
  );
}
