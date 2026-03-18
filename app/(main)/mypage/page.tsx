import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { getMyReservations } from '@/lib/actions/reservation';
import { getCurrentUserProfile } from '@/lib/actions/auth';
import { ReservationCard } from '@/components/domain/reservation/ReservationCard';

export const metadata: Metadata = {
  title: '마이페이지',
};

export default async function MyPage() {
  const [profile, reservations] = await Promise.all([getCurrentUserProfile(), getMyReservations()]);

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      {/* Profile section */}
      <div className="mb-8">
        <h1 className="font-display text-charcoal text-2xl">마이페이지</h1>
        {profile && <p className="font-ui text-gray mt-1 text-sm">{profile.name}님, 안녕하세요.</p>}
      </div>

      {/* Reservations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ui text-charcoal text-lg font-semibold">내 예약</h2>
          <Link
            href="/reservation"
            className="font-ui text-gold-dark flex items-center gap-1 text-sm font-medium hover:underline"
          >
            <CalendarDays size={14} strokeWidth={1.5} />새 예약
          </Link>
        </div>

        {reservations.length === 0 ? (
          <div className="border-gray-light rounded-xl border bg-white py-12 text-center">
            <CalendarDays size={32} strokeWidth={1.5} className="text-gray mx-auto mb-3" />
            <p className="font-ui text-gray text-sm">아직 예약 내역이 없습니다.</p>
            <Link
              href="/reservation"
              className="font-ui text-gold-dark mt-2 inline-block text-sm font-medium hover:underline"
            >
              예약하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
