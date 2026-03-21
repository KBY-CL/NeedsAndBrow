import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { getInquiryById } from '@/lib/actions/inquiry';
import { InquiryDetail } from './InquiryDetail';

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [inquiry, supabase] = await Promise.all([getInquiryById(id), createServerClient()]);
  if (!inquiry) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <Link
        href="/inquiry"
        className="font-ui text-gray mb-6 inline-flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft size={14} />
        목록으로
      </Link>

      <InquiryDetail inquiry={inquiry} currentUserId={user?.id ?? null} />
    </div>
  );
}
