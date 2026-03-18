'use client';

import { useState } from 'react';
import { MessageSquare, CheckCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { answerInquiry } from '@/lib/actions/inquiry';
import type { Inquiry } from '@/types/database.types';

type InquiryRow = Inquiry & { profile: { name: string } | null };

export function AdminInquiryList({ initialInquiries }: { initialInquiries: InquiryRow[] }) {
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = async (id: string) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    await answerInquiry(id, answerText);
    setAnsweringId(null);
    setAnswerText('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-3">
      {initialInquiries.map((inq) => (
        <div key={inq.id} className="border-gray-light shadow-soft rounded-xl border bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-ui text-charcoal text-sm font-semibold">{inq.title}</span>
                <span
                  className={cn(
                    'font-ui rounded-full px-2 py-0.5 text-xs font-medium',
                    inq.status === 'answered'
                      ? 'bg-success/20 text-success'
                      : 'bg-warning/20 text-warning',
                  )}
                >
                  {inq.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
              </div>
              <p className="font-ui text-gray mt-1 text-xs">
                {inq.profile?.name ?? '비회원'} &middot;{' '}
                {new Date(inq.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          <p className="font-ui text-charcoal-light mt-3 text-sm whitespace-pre-wrap">
            {inq.content}
          </p>

          {inq.answer && (
            <div className="bg-cream mt-3 rounded-lg p-3">
              <div className="flex items-center gap-1">
                <CheckCircle size={12} className="text-success" />
                <span className="font-ui text-success text-xs font-semibold">답변</span>
              </div>
              <p className="font-ui text-charcoal-light mt-1 text-sm whitespace-pre-wrap">
                {inq.answer}
              </p>
            </div>
          )}

          {inq.status === 'pending' && (
            <>
              {answeringId === inq.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    rows={3}
                    placeholder="답변을 입력하세요"
                    className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAnswer(inq.id)}
                      disabled={submitting || !answerText.trim()}
                      className="font-ui bg-gold hover:bg-gold-dark inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-white disabled:opacity-50"
                    >
                      <Send size={12} />
                      {submitting ? '등록 중...' : '답변 등록'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnsweringId(null);
                        setAnswerText('');
                      }}
                      className="font-ui text-gray h-8 rounded-lg px-3 text-xs hover:underline"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAnsweringId(inq.id)}
                  className="font-ui text-gold-dark mt-3 flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <MessageSquare size={12} />
                  답변 작성
                </button>
              )}
            </>
          )}
        </div>
      ))}
      {initialInquiries.length === 0 && (
        <p className="font-ui text-gray py-8 text-center text-sm">등록된 문의가 없습니다.</p>
      )}
    </div>
  );
}
