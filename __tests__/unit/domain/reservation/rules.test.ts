import { describe, it, expect } from 'vitest';
import { canCancelReservation, isValidReservationDate } from '@/lib/domain/reservation/rules';

describe('canCancelReservation', () => {
  const base = {
    date: '2026-03-20',
    time_slot: '14:00',
    status: 'confirmed' as const,
  };

  it('예약 시간 2시간 이상 전이면 취소 가능', () => {
    // 14:00 예약, 현재 11:00 → 3시간 전
    const now = new Date('2026-03-20T02:00:00Z'); // UTC 02:00 = KST 11:00
    const result = canCancelReservation(base, now);
    expect(result.ok).toBe(true);
  });

  it('예약 시간 정확히 2시간 전이면 취소 가능', () => {
    // 14:00 KST 예약, 현재 12:00 KST
    const now = new Date('2026-03-20T03:00:00Z'); // UTC 03:00 = KST 12:00
    const result = canCancelReservation(base, now);
    expect(result.ok).toBe(true);
  });

  it('예약 시간 2시간 미만이면 취소 불가', () => {
    // 14:00 KST 예약, 현재 13:00 KST
    const now = new Date('2026-03-20T04:00:00Z'); // UTC 04:00 = KST 13:00
    const result = canCancelReservation(base, now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('2시간');
    }
  });

  it('예약 시간이 지난 경우 취소 불가', () => {
    const now = new Date('2026-03-20T06:00:00Z'); // UTC 06:00 = KST 15:00
    const result = canCancelReservation(base, now);
    expect(result.ok).toBe(false);
  });

  it('이미 취소된 예약은 취소 불가', () => {
    const cancelled = { ...base, status: 'cancelled' as const };
    const result = canCancelReservation(cancelled);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('이미 취소');
    }
  });

  it('이미 거절된 예약은 취소 불가', () => {
    const rejected = { ...base, status: 'rejected' as const };
    const result = canCancelReservation(rejected);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('거절');
    }
  });

  it('pending 상태도 취소 가능 (시간 조건 충족 시)', () => {
    const pending = { ...base, status: 'pending' as const };
    const now = new Date('2026-03-20T02:00:00Z');
    const result = canCancelReservation(pending, now);
    expect(result.ok).toBe(true);
  });
});

describe('isValidReservationDate', () => {
  it('오늘 날짜는 예약 가능', () => {
    const now = new Date('2026-03-20T05:00:00Z'); // KST 14:00
    const result = isValidReservationDate('2026-03-20', now);
    expect(result.ok).toBe(true);
  });

  it('미래 날짜는 예약 가능', () => {
    const now = new Date('2026-03-20T05:00:00Z');
    const result = isValidReservationDate('2026-03-25', now);
    expect(result.ok).toBe(true);
  });

  it('과거 날짜는 예약 불가', () => {
    const now = new Date('2026-03-20T05:00:00Z');
    const result = isValidReservationDate('2026-03-19', now);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('과거');
    }
  });

  it('한참 과거 날짜도 불가', () => {
    const now = new Date('2026-03-20T05:00:00Z');
    const result = isValidReservationDate('2025-01-01', now);
    expect(result.ok).toBe(false);
  });
});
