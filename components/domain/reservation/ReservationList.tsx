'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { ReservationCard } from './ReservationCard';
import type { ReservationWithDetails } from '@/lib/domain/reservation/types';

interface ReservationListProps {
  reservations: ReservationWithDetails[];
}

export function ReservationList({ reservations }: ReservationListProps) {
  const [showPast, setShowPast] = useState(false);

  const active = reservations.filter((r) => r.status === 'pending' || r.status === 'confirmed');
  const past = reservations.filter((r) => r.status === 'cancelled' || r.status === 'rejected');

  if (reservations.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-3">
      {active.length === 0 && (
        <p className="font-ui text-gray py-4 text-center text-sm">진행 중인 예약이 없습니다.</p>
      )}

      {active.map((r) => (
        <ReservationCard key={r.id} reservation={r} />
      ))}

      {past.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            className="font-ui text-gray hover:text-charcoal flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
          >
            {showPast ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            지난 예약 ({past.length})
          </button>

          {showPast && (
            <div className="mt-3 space-y-3">
              {past.map((r) => (
                <ReservationCard key={r.id} reservation={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
