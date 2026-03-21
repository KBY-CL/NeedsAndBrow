import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { getMyReservations } from '@/lib/actions/reservation';
import { getCurrentUserProfile } from '@/lib/actions/auth';
import { ReservationList } from '@/components/domain/reservation/ReservationList';
import { ProfileEditForm } from './ProfileEditForm';

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

      {/* Profile Edit */}
      {profile && (
        <section className="mb-10">
          <h2 className="font-ui text-charcoal mb-4 text-lg font-semibold">프로필 수정</h2>
          <ProfileEditForm profile={profile} />
        </section>
      )}

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

        <ReservationList reservations={reservations} />
      </section>
    </div>
  );
}
