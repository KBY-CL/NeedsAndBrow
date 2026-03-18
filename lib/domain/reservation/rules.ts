import type { Reservation } from '@/types/database.types';
import type { RuleResult } from './types';

/**
 * 예약 취소 가능 여부: 예약 시간 2시간 전까지만 가능
 */
export function canCancelReservation(
  reservation: Pick<Reservation, 'date' | 'time_slot' | 'status'>,
  now: Date = new Date(),
): RuleResult {
  if (reservation.status === 'cancelled') {
    return { ok: false, reason: '이미 취소된 예약입니다.' };
  }
  if (reservation.status === 'rejected') {
    return { ok: false, reason: '이미 거절된 예약입니다.' };
  }

  const reservationTime = new Date(`${reservation.date}T${reservation.time_slot}:00+09:00`);
  const hoursUntil = (reservationTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 2) {
    return { ok: false, reason: '예약 시간 2시간 전까지만 취소 가능합니다.' };
  }

  return { ok: true };
}

/**
 * 예약 날짜 유효성: 과거 날짜 불가
 */
export function isValidReservationDate(date: string, now: Date = new Date()): RuleResult {
  const target = new Date(date + 'T00:00:00+09:00');
  const today = new Date(
    now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) + 'T00:00:00+09:00',
  );

  if (target < today) {
    return { ok: false, reason: '과거 날짜는 예약할 수 없습니다.' };
  }

  return { ok: true };
}
