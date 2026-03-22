'use client';

import { useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { confirmReservation, rejectReservation } from '@/lib/actions/admin-reservation';

export function DashboardActions({ reservationId }: { reservationId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmReservation(reservationId);
    });
  };

  const handleReject = () => {
    if (!confirm('이 예약을 거절하시겠습니까?')) return;
    startTransition(async () => {
      await rejectReservation(reservationId);
    });
  };

  return (
    <div className="ml-2 flex shrink-0 gap-1">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="bg-success/10 text-success hover:bg-success/20 flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
        title="확정"
      >
        <Check size={14} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={isPending}
        className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
        title="거절"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
