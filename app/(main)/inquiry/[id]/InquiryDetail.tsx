'use client';

import { useState } from 'react';
import { Lock, CheckCircle, Clock } from 'lucide-react';
import { verifyInquiryPassword } from '@/lib/actions/inquiry';
import type { Inquiry } from '@/types/database.types';

type InquiryRow = Inquiry & { profile: { name: string } | null };

export function InquiryDetail({ inquiry }: { inquiry: InquiryRow }) {
  const [verified, setVerified] = useState(!inquiry.password_hash);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    const result = await verifyInquiryPassword(inquiry.id, password);
    if (result.success) {
      setVerified(true);
    } else {
      setError(result.error);
    }
    setVerifying(false);
  };

  // Password gate
  if (!verified) {
    return (
      <div className="py-12 text-center">
        <Lock size={32} strokeWidth={1.5} className="text-gray mx-auto mb-4" />
        <h2 className="font-ui text-charcoal mb-4 text-lg font-semibold">비밀번호 확인</h2>
        <p className="font-ui text-gray mb-6 text-sm">이 문의는 비밀번호로 보호되어 있습니다.</p>
        <div className="mx-auto flex max-w-xs gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="비밀번호 입력"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 flex-1 rounded-lg border px-4 py-2.5 text-sm focus:ring-1"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying || !password}
            className="font-ui bg-charcoal shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
          >
            확인
          </button>
        </div>
        {error && <p className="font-ui text-error mt-3 text-sm">{error}</p>}
      </div>
    );
  }

  // Content
  return (
    <article>
      <h1 className="font-display text-charcoal mb-2 text-2xl">{inquiry.title}</h1>
      <div className="font-ui text-gray mb-6 flex items-center gap-3 text-sm">
        <span>{inquiry.profile?.name ?? '비회원'}</span>
        <span>&middot;</span>
        <span>{new Date(inquiry.created_at).toLocaleDateString('ko-KR')}</span>
      </div>

      <div className="font-ui text-charcoal-light mb-8 text-base leading-relaxed whitespace-pre-wrap">
        {inquiry.content}
      </div>

      {/* Answer */}
      {inquiry.answer ? (
        <div className="border-gold/30 bg-gold/5 rounded-xl border p-5">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle size={16} className="text-gold-dark" />
            <span className="font-ui text-gold-dark text-sm font-semibold">관리자 답변</span>
          </div>
          <div className="font-ui text-charcoal-light text-sm leading-relaxed whitespace-pre-wrap">
            {inquiry.answer}
          </div>
          {inquiry.answered_at && (
            <p className="font-ui text-gray mt-3 text-xs">
              {new Date(inquiry.answered_at).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
      ) : (
        <div className="border-gray-light rounded-xl border bg-white p-5 text-center">
          <Clock size={20} className="text-gray mx-auto mb-2" />
          <p className="font-ui text-gray text-sm">답변 대기중입니다.</p>
        </div>
      )}
    </article>
  );
}
