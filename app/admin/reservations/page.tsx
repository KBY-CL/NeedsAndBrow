import type { Metadata } from 'next';
import { AdminReservationList } from './AdminReservationList';

export const metadata: Metadata = {
  title: '예약 관리',
};

export default function AdminReservationsPage() {
  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">예약 관리</h1>
      <AdminReservationList />
    </div>
  );
}
