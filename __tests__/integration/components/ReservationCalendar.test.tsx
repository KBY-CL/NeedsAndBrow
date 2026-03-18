import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReservationCalendar } from '@/components/domain/reservation/ReservationCalendar';

// 2026-03-20을 기준 날짜로 사용
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-03-20T05:00:00Z'));

describe('ReservationCalendar', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T05:00:00Z'));
  });

  it('현재 월의 날짜를 표시한다', () => {
    render(<ReservationCalendar selectedDate={null} onSelect={vi.fn()} />);

    expect(screen.getByText('2026년 3월')).toBeInTheDocument();
    // 요일 헤더
    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('토')).toBeInTheDocument();
  });

  it('날짜 클릭 시 onSelect가 호출된다', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const onSelect = vi.fn();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T05:00:00Z'));

    render(<ReservationCalendar selectedDate={null} onSelect={onSelect} />);

    // 21일 클릭 (미래 날짜)
    const day21 = screen.getAllByText('21').find((el) => !el.closest('button')?.disabled);
    if (day21) {
      vi.useRealTimers();
      await user.click(day21);
      expect(onSelect).toHaveBeenCalledWith('2026-03-21');
    }
  });

  it('마감된 날짜에 빨간 점이 표시된다', () => {
    render(
      <ReservationCalendar selectedDate={null} blockedDates={['2026-03-25']} onSelect={vi.fn()} />,
    );

    // 25일 버튼 안에 빨간 점(bg-error) 스팬이 있어야 함
    const day25 = screen.getAllByText('25').find((el) => el.closest('button'));
    const indicator = day25?.closest('button')?.querySelector('.bg-error');
    expect(indicator).toBeInTheDocument();
  });

  it('이전 달 / 다음 달 네비게이션이 동작한다', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();

    render(<ReservationCalendar selectedDate={null} onSelect={vi.fn()} />);

    // 다음 달
    const nextBtn = screen.getByLabelText('다음 달');
    await user.click(nextBtn);
    expect(screen.getByText('2026년 4월')).toBeInTheDocument();

    // 이전 달 (두번 클릭해서 2월로)
    const prevBtn = screen.getByLabelText('이전 달');
    await user.click(prevBtn);
    await user.click(prevBtn);
    expect(screen.getByText('2026년 2월')).toBeInTheDocument();
  });
});
