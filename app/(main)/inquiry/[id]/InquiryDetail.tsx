'use client';

import { useState, useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, Clock, Pencil, Trash2, X } from 'lucide-react';
import { verifyInquiryPassword, updateInquiry, deleteInquiry } from '@/lib/actions/inquiry';
import type { Inquiry } from '@/types/database.types';

type InquiryRow = Inquiry & { profile: { name: string } | null };

export function InquiryDetail({
  inquiry,
  currentUserId,
}: {
  inquiry: InquiryRow;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [verified, setVerified] = useState(!inquiry.password_hash);
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const isOwner = !!currentUserId && inquiry.user_id === currentUserId;
  const canEdit = verified || isOwner;

  const boundUpdate = updateInquiry.bind(null, inquiry.id, verifiedPassword);
  const [updateState, updateAction, isUpdatePending] = useActionState(boundUpdate, null);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError(null);
    const result = await verifyInquiryPassword(inquiry.id, password);
    if (result.success) {
      setVerified(true);
      setVerifiedPassword(password);
    } else {
      setVerifyError(result.error ?? null);
    }
    setVerifying(false);
  };

  const handleDelete = () => {
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;
    startDeleteTransition(async () => {
      const result = await deleteInquiry(inquiry.id, verifiedPassword);
      if (result.success) {
        router.push('/inquiry');
      } else {
        setDeleteError(result.error ?? '삭제에 실패했습니다.');
      }
    });
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
        {verifyError && <p className="font-ui text-error mt-3 text-sm">{verifyError}</p>}
      </div>
    );
  }

  // Edit form
  if (editing) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ui text-charcoal text-lg font-semibold">문의 수정</h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-gray hover:text-charcoal"
          >
            <X size={18} />
          </button>
        </div>
        <form action={updateAction} className="space-y-4">
          <div>
            <label htmlFor="title" className="font-ui text-charcoal mb-1 block text-sm font-medium">
              제목
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={inquiry.title}
              maxLength={100}
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="font-ui text-charcoal mb-1 block text-sm font-medium"
            >
              내용
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={6}
              maxLength={2000}
              defaultValue={inquiry.content}
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
            />
          </div>
          {updateState && !updateState.success && (
            <p className="font-ui text-error text-sm">{updateState.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isUpdatePending}
              className="font-ui bg-gold hover:bg-gold-dark h-10 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              {isUpdatePending ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="font-ui text-gray h-10 rounded-lg px-4 text-sm hover:underline"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Content
  return (
    <article>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-charcoal mb-2 text-2xl">{inquiry.title}</h1>
          <div className="font-ui text-gray flex items-center gap-3 text-sm">
            <span>{inquiry.profile?.name ?? '비회원'}</span>
            <span>&middot;</span>
            <span>{inquiry.contact_phone}</span>
            <span>&middot;</span>
            <span>{new Date(inquiry.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        {canEdit && (
          <div className="flex shrink-0 gap-1">
            {inquiry.status !== 'answered' && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-gray hover:text-gold-dark flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-amber-50"
                title="수정"
              >
                <Pencil size={15} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="bg-error/10 text-error hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
              title="삭제"
            >
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {deleteError && <p className="font-ui text-error mb-4 text-sm">{deleteError}</p>}

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
