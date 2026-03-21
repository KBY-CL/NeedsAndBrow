import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InquiryDetail } from '@/app/(main)/inquiry/[id]/InquiryDetail';
import type { Inquiry } from '@/types/database.types';

// Mock the server action
vi.mock('@/lib/actions/inquiry', () => ({
  verifyInquiryPassword: vi.fn(),
  updateInquiry: vi.fn(),
  deleteInquiry: vi.fn(),
}));

type InquiryRow = Inquiry & { profile: { name: string } | null };

const baseInquiry: InquiryRow = {
  id: 'inq-1',
  user_id: 'user-1',
  title: '시술 관련 문의',
  content: '자연스러운 연장이 가능한가요?',
  contact_phone: '010-1234-5678',
  password_hash: null,
  answer: null,
  answered_at: null,
  status: 'pending',
  created_at: '2026-03-15T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
  profile: { name: '홍길동' },
};

describe('InquiryDetail', () => {
  it('비밀번호가 없는 문의는 바로 내용을 표시한다', () => {
    render(<InquiryDetail inquiry={baseInquiry} currentUserId={null} />);

    expect(screen.getByText('시술 관련 문의')).toBeInTheDocument();
    expect(screen.getByText('자연스러운 연장이 가능한가요?')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('비밀번호가 있는 문의는 비밀번호 입력 화면을 표시한다', () => {
    const withPassword = { ...baseInquiry, password_hash: 'dGVzdA==' };
    render(<InquiryDetail inquiry={withPassword} currentUserId={null} />);

    expect(screen.getByText('비밀번호 확인')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 입력')).toBeInTheDocument();
    expect(screen.queryByText('자연스러운 연장이 가능한가요?')).not.toBeInTheDocument();
  });

  it('답변이 없으면 대기중 표시를 한다', () => {
    render(<InquiryDetail inquiry={baseInquiry} currentUserId={null} />);

    expect(screen.getByText('답변 대기중입니다.')).toBeInTheDocument();
  });

  it('답변이 있으면 답변 내용을 표시한다', () => {
    const withAnswer: InquiryRow = {
      ...baseInquiry,
      answer: '네, 가능합니다. 상담 후 진행해드립니다.',
      answered_at: '2026-03-16T00:00:00Z',
      status: 'answered',
    };

    render(<InquiryDetail inquiry={withAnswer} currentUserId={null} />);

    expect(screen.getByText('관리자 답변')).toBeInTheDocument();
    expect(screen.getByText('네, 가능합니다. 상담 후 진행해드립니다.')).toBeInTheDocument();
  });

  it('비회원 문의는 "비회원"으로 표시한다', () => {
    const anonymous: InquiryRow = { ...baseInquiry, user_id: null, profile: null };
    render(<InquiryDetail inquiry={anonymous} currentUserId={null} />);

    expect(screen.getByText('비회원')).toBeInTheDocument();
  });
});
