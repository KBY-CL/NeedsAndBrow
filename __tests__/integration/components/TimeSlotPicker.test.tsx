import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeSlotPicker } from '@/components/domain/reservation/TimeSlotPicker';
import type { AvailableSlot } from '@/lib/domain/reservation/types';

const mockSlots: AvailableSlot[] = [
  {
    id: 'slot-1',
    time: '10:00',
    is_active: true,
    max_reservations: 1,
    sort_order: 0,
    remainingCapacity: 1,
  },
  {
    id: 'slot-2',
    time: '11:00',
    is_active: true,
    max_reservations: 1,
    sort_order: 1,
    remainingCapacity: 0,
  },
  {
    id: 'slot-3',
    time: '14:00',
    is_active: true,
    max_reservations: 2,
    sort_order: 2,
    remainingCapacity: 2,
  },
];

describe('TimeSlotPicker', () => {
  it('시간 슬롯 목록을 표시한다', () => {
    render(
      <TimeSlotPicker slots={mockSlots} selectedTime={null} loading={false} onSelect={vi.fn()} />,
    );

    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
    expect(screen.getByText('14:00')).toBeInTheDocument();
  });

  it('마감된 슬롯은 비활성화 표시된다', () => {
    render(
      <TimeSlotPicker slots={mockSlots} selectedTime={null} loading={false} onSelect={vi.fn()} />,
    );

    const fullSlot = screen.getByText('11:00').closest('button');
    expect(fullSlot).toBeDisabled();
    expect(screen.getByText('마감')).toBeInTheDocument();
  });

  it('슬롯 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <TimeSlotPicker slots={mockSlots} selectedTime={null} loading={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByText('10:00'));
    expect(onSelect).toHaveBeenCalledWith(mockSlots[0]);
  });

  it('마감된 슬롯은 클릭할 수 없다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <TimeSlotPicker slots={mockSlots} selectedTime={null} loading={false} onSelect={onSelect} />,
    );

    await user.click(screen.getByText('11:00'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('로딩 중이면 스피너를 표시한다', () => {
    render(<TimeSlotPicker slots={[]} selectedTime={null} loading={true} onSelect={vi.fn()} />);

    expect(screen.queryByText('10:00')).not.toBeInTheDocument();
    // 스피너 존재 (animate-spin 클래스)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('슬롯이 비어있으면 안내 메시지를 표시한다', () => {
    render(<TimeSlotPicker slots={[]} selectedTime={null} loading={false} onSelect={vi.fn()} />);

    expect(screen.getByText(/가능한 시간이 없습니다/)).toBeInTheDocument();
  });

  it('선택된 슬롯이 시각적으로 강조된다', () => {
    render(
      <TimeSlotPicker slots={mockSlots} selectedTime="10:00" loading={false} onSelect={vi.fn()} />,
    );

    const selected = screen.getByText('10:00').closest('button');
    expect(selected?.className).toContain('border-gold');
  });
});
