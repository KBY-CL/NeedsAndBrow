import type { Metadata } from 'next';
import { getAllEvents } from '@/lib/actions/event';
import { AdminEventList } from './AdminEventList';

export const metadata: Metadata = { title: '이벤트 관리' };

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">이벤트 관리</h1>
      <AdminEventList initialEvents={events} />
    </div>
  );
}
