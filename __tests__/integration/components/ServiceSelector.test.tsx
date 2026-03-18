import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServiceSelector } from '@/components/domain/reservation/ServiceSelector';
import { mockServices } from '@/__tests__/mocks/data';

describe('ServiceSelector', () => {
  it('카테고리별로 서비스를 그룹화하여 표시한다', () => {
    render(<ServiceSelector services={mockServices} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByText('속눈썹 연장')).toBeInTheDocument();
    expect(screen.getByText('눈썹 문신')).toBeInTheDocument();
    expect(screen.getByText('내추럴 속눈썹 연장')).toBeInTheDocument();
    expect(screen.getByText('볼륨 속눈썹 연장')).toBeInTheDocument();
    expect(screen.getByText('콤보 눈썹 문신')).toBeInTheDocument();
  });

  it('가격과 소요시간을 표시한다', () => {
    render(<ServiceSelector services={mockServices} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByText('70,000원')).toBeInTheDocument();
    expect(screen.getByText('90분')).toBeInTheDocument();
    expect(screen.getByText('150,000원')).toBeInTheDocument();
  });

  it('서비스 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ServiceSelector services={mockServices} selectedId={null} onSelect={onSelect} />);

    await user.click(screen.getByText('내추럴 속눈썹 연장'));
    expect(onSelect).toHaveBeenCalledWith(mockServices[0]);
  });

  it('선택된 서비스가 시각적으로 강조된다', () => {
    render(<ServiceSelector services={mockServices} selectedId="service-1" onSelect={vi.fn()} />);

    const selected = screen.getByText('내추럴 속눈썹 연장').closest('button');
    expect(selected?.className).toContain('border-gold');
  });

  it('빈 서비스 목록이면 아무것도 렌더링하지 않는다', () => {
    render(<ServiceSelector services={[]} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.queryByText('속눈썹 연장')).not.toBeInTheDocument();
  });
});
