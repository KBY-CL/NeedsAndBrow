import { describe, it, expect } from 'vitest';

// event.ts의 getEventStatus는 private이므로, getActiveEvents/getEventById를 통해 간접 테스트할 수도 있지만
// 로직 자체를 테스트하기 위해 동일 로직을 추출해서 테스트한다.
// 실제로는 lib/actions/event.ts의 getEventStatus가 내부 함수이므로
// 동일 로직을 순수 함수로 테스트한다.

function getEventStatus(startDate: string, endDate: string, now: Date): '예정' | '진행중' | '종료' {
  const start = new Date(startDate);
  const end = new Date(endDate + 'T23:59:59');

  if (now < start) return '예정';
  if (now > end) return '종료';
  return '진행중';
}

describe('getEventStatus', () => {
  it('시작일 이전이면 "예정"', () => {
    const now = new Date('2026-02-28');
    expect(getEventStatus('2026-03-01', '2026-03-31', now)).toBe('예정');
  });

  it('시작일과 종료일 사이이면 "진행중"', () => {
    const now = new Date('2026-03-15');
    expect(getEventStatus('2026-03-01', '2026-03-31', now)).toBe('진행중');
  });

  it('시작일 당일이면 "진행중"', () => {
    const now = new Date('2026-03-01T12:00:00');
    expect(getEventStatus('2026-03-01', '2026-03-31', now)).toBe('진행중');
  });

  it('종료일 당일이면 "진행중"', () => {
    const now = new Date('2026-03-31T12:00:00');
    expect(getEventStatus('2026-03-01', '2026-03-31', now)).toBe('진행중');
  });

  it('종료일 다음날이면 "종료"', () => {
    const now = new Date('2026-04-01');
    expect(getEventStatus('2026-03-01', '2026-03-31', now)).toBe('종료');
  });

  it('시작일과 종료일이 같은 당일 이벤트 — 당일이면 "진행중"', () => {
    const now = new Date('2026-03-15T10:00:00');
    expect(getEventStatus('2026-03-15', '2026-03-15', now)).toBe('진행중');
  });

  it('시작일과 종료일이 같은 당일 이벤트 — 다음날이면 "종료"', () => {
    const now = new Date('2026-03-16');
    expect(getEventStatus('2026-03-15', '2026-03-15', now)).toBe('종료');
  });
});
