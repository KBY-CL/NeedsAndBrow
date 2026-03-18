import type { Metadata } from 'next';
import { getAllInquiriesAdmin } from '@/lib/actions/inquiry';
import { AdminInquiryList } from './AdminInquiryList';

export const metadata: Metadata = { title: '상담 문의 관리' };

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiriesAdmin();
  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">상담 문의 관리</h1>
      <AdminInquiryList initialInquiries={inquiries} />
    </div>
  );
}
