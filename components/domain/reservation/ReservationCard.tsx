'use client';

import { useState } from 'react';
import { CalendarDays, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cancelReservation } from '@/lib/actions/reservation';
import type { ReservationWithDetails } from '@/lib/domain/reservation/types';
import type { ReservationStatus } from '@/types/database.types';

const statusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: '확인중', className: 'bg-warning/20 text-warning' },
  confirmed: { label: '예약됨', className: 'bg-success/20 text-success' },
  rejected: { label: '불가', className: 'bg-error/20 text-error' },
  cancelled: { label: '취소됨', className: 'bg-gray-light text-gray' },
};

interface ReservationCardProps {
  reservation: ReservationWithDetails;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = statusConfig[reservation.status];
  const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';

  const handleCancel = async () => {
    if (!confirm('예약을 취소하시겠습니까?')) return;
    setCancelling(true);
    setError(null);
    const result = await cancelReservation(reservation.id);
    if (!result.success) {
      setError(result.error);
    }
    setCancelling(false);
  };

  return (
    <div className="border-gray-light shadow-soft rounded-xl border bg-white p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-ui text-charcoal text-sm font-semibold">{reservation.service.name}</p>
          <p className="font-ui text-gray text-xs">
            {reservation.service.category} &middot; {reservation.service.duration}분
          </p>
        </div>
        <span
          className={cn('font-ui rounded-full px-2.5 py-0.5 text-xs font-medium', status.className)}
        >
          {status.label}
        </span>
      </div>

      <div className="font-ui text-charcoal-light space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} strokeWidth={1.5} />
          <span>{reservation.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} strokeWidth={1.5} />
          <span>{reservation.time_slot}</span>
        </div>
      </div>

      {reservation.user_note && (
        <p className="font-ui text-gray mt-2 text-xs">메모: {reservation.user_note}</p>
      )}

      {reservation.admin_note && (
        <p className="font-ui text-info mt-2 text-xs">관리자 메모: {reservation.admin_note}</p>
      )}

      {error && <p className="font-ui text-error mt-2 text-xs">{error}</p>}

      {canCancel && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="font-ui mt-3 flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-700 disabled:opacity-50"
        >
          <X size={12} strokeWidth={1.5} />
          {cancelling ? '취소 중...' : '예약 취소'}
        </button>
      )}
    </div>
  );
}
