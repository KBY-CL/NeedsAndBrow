'use client';

import { useState, useTransition, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, ChevronLeft, ChevronRight, CalendarSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getReservationsByDate,
  confirmReservation,
  rejectReservation,
} from '@/lib/actions/admin-reservation';
import type { ReservationStatus } from '@/types/database.types';

type ReservationRow = Awaited<ReturnType<typeof getReservationsByDate>>[number];

const statusConfig: Record<ReservationStatus, { label: string; className: string }> = {
  pending: { label: '확인중', className: 'bg-warning/20 text-warning' },
  confirmed: { label: '확정', className: 'bg-success/20 text-success' },
  rejected: { label: '불가', className: 'bg-error/20 text-error' },
  cancelled: { label: '취소', className: 'bg-gray-light text-gray' },
};

const TODAY = format(new Date(), 'yyyy-MM-dd');

export function AdminReservationList() {
  const [date, setDate] = useState(TODAY);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadReservations = (targetDate: string) => {
    startTransition(async () => {
      const data = await getReservationsByDate(targetDate);
      setReservations(data);
    });
  };

  // 페이지 진입 시 오늘 예약 자동 조회
  useEffect(() => {
    loadReservations(TODAY);
  }, []);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    loadReservations(newDate);
  };

  const handleConfirm = (id: string) => {
    startTransition(async () => {
      await confirmReservation(id);
      const data = await getReservationsByDate(date);
      setReservations(data);
    });
  };

  const handleReject = (id: string) => {
    const note = prompt('거절 사유를 입력하세요 (선택)');
    startTransition(async () => {
      await rejectReservation(id, note ?? undefined);
      const data = await getReservationsByDate(date);
      setReservations(data);
    });
  };

  const shiftDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    handleDateChange(format(d, 'yyyy-MM-dd'));
  };

  const isToday = date === TODAY;

  return (
    <div>
      {/* 현재 조회 날짜 표시 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-ui text-charcoal text-base font-semibold">
            {isToday ? '오늘' : date}
          </span>
          {!isToday && (
            <button
              type="button"
              onClick={() => {
                setShowDatePicker(false);
                handleDateChange(TODAY);
              }}
              className="font-ui text-gold-dark text-xs hover:underline"
            >
              오늘로 돌아가기
            </button>
          )}
        </div>
        <span className="font-ui text-gray text-sm">
          {isPending ? '로딩...' : `${reservations.length}건`}
        </span>
      </div>

      {/* 다른 날짜 조회 패널 */}
      {showDatePicker && (
        <div className="border-gray-light shadow-soft mb-4 flex items-center gap-2 rounded-xl border bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="border-gray-light hover:bg-cream flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border-gray-light font-ui text-charcoal min-w-0 flex-1 rounded-lg border px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="border-gray-light hover:bg-cream flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* 예약 목록 */}
      {isPending ? (
        <div className="py-12 text-center">
          <div className="border-gold mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : reservations.length === 0 ? (
        <p className="font-ui text-gray py-12 text-center text-sm">해당 날짜에 예약이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const status = statusConfig[r.status];
            const profile = r.profile as { name: string; phone: string | null } | null;
            const service = r.service as { name: string; category: string } | null;

            return (
              <div
                key={r.id}
                className="border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-ui text-charcoal text-sm font-semibold">
                      {r.time_slot}
                    </span>
                    <span
                      className={cn(
                        'font-ui rounded-full px-2 py-0.5 text-xs font-medium',
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="font-ui text-charcoal-light mt-1 text-sm">
                    {profile?.name ?? '알 수 없음'} &middot; {profile?.phone ?? '-'}
                  </p>
                  <p className="font-ui text-gray text-xs">{service?.name ?? '-'}</p>
                  {r.user_note && (
                    <p className="font-ui text-gray mt-1 text-xs">메모: {r.user_note}</p>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="ml-3 flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirm(r.id)}
                      className="bg-success/10 text-success hover:bg-success/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      title="확정"
                    >
                      <Check size={16} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(r.id)}
                      className="bg-error/10 text-error hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      title="거절"
                    >
                      <X size={16} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 다른 날짜 조회 버튼 */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setShowDatePicker((v) => !v)}
          className={cn(
            'font-ui inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors',
            showDatePicker
              ? 'bg-gray-light text-charcoal hover:bg-gray-light/80'
              : 'border-gray-light text-charcoal hover:bg-cream border',
          )}
        >
          <CalendarSearch size={15} strokeWidth={1.5} />
          {showDatePicker ? '날짜 선택 닫기' : '다른 날짜 조회하기'}
        </button>
      </div>
    </div>
  );
}
