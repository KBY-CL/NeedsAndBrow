import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine, Lock, MessageSquare } from 'lucide-react';
import { getInquiries } from '@/lib/actions/inquiry';

export const metadata: Metadata = {
  title: '상담 문의',
  description: '1:1 상담 문의 게시판',
};

const statusConfig = {
  pending: { text: '답변대기', className: 'bg-warning/20 text-warning' },
  answered: { text: '답변완료', className: 'bg-success/20 text-success' },
} as const;

const fallbackStatus = statusConfig['pending'];

function getStatus(status: string) {
  return statusConfig[status as keyof typeof statusConfig] ?? fallbackStatus;
}

export default async function InquiryListPage() {
  const inquiries = await getInquiries();

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-charcoal text-2xl">상담 문의</h1>
          <p className="font-ui text-gray mt-1 text-sm">궁금한 점을 문의해 주세요.</p>
        </div>
        <Link
          href="/inquiry/write"
          className="font-ui bg-charcoal inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white hover:bg-black"
        >
          <PenLine size={14} strokeWidth={1.5} />
          문의하기
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="border-gray-light rounded-xl border bg-white py-12 text-center">
          <MessageSquare size={32} strokeWidth={1.5} className="text-gray mx-auto mb-3" />
          <p className="font-ui text-gray text-sm">등록된 문의가 없습니다.</p>
        </div>
      ) : (
        <div className="border-gray-light shadow-soft overflow-hidden rounded-xl border bg-white">
          {inquiries.map((inq, i) => {
            const status = getStatus(inq.status);
            const hasPassword = inq.has_password;

            return (
              <Link
                key={inq.id}
                href={`/inquiry/${inq.id}`}
                className={`hover:bg-cream flex items-center justify-between px-5 py-4 transition-colors ${
                  i > 0 ? 'border-gray-light border-t' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {hasPassword && <Lock size={12} className="text-gray shrink-0" />}
                    <span className="font-ui text-charcoal truncate text-sm font-medium">
                      {inq.title}
                    </span>
                  </div>
                  <span className="font-ui text-gray text-xs">
                    {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <span
                  className={`font-ui shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                >
                  {status.text}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
