import type { Metadata } from 'next';
import { getAllTimeSlots, getBlockedDates } from '@/lib/actions/admin-timeslot';
import { AdminTimeSlotList } from './AdminTimeSlotList';

export const metadata: Metadata = {
  title: '시간 슬롯 관리',
};

export default async function AdminTimeSlotsPage() {
  const [timeSlots, blockedDates] = await Promise.all([getAllTimeSlots(), getBlockedDates()]);

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">시간 슬롯 & 마감일 관리</h1>
      <AdminTimeSlotList initialSlots={timeSlots} initialBlockedDates={blockedDates} />
    </div>
  );
}
