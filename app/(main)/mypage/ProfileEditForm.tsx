'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, deactivateAccount } from '@/lib/actions/profile';
import type { Profile } from '@/types/database.types';

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  const handleDeactivate = async () => {
    if (!confirm('정말 탈퇴하시겠습니까?\n30일 이내에 다시 로그인하면 복구할 수 있습니다.')) return;
    const result = await deactivateAccount();
    if (result.success) {
      router.push('/');
    }
  };

  return (
    <div>
      <form
        action={formAction}
        className="border-gray-light shadow-soft rounded-xl border bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="font-ui text-charcoal mb-1.5 block text-sm font-medium"
            >
              이름
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={profile.name}
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="font-ui text-charcoal mb-1.5 block text-sm font-medium"
            >
              휴대폰 번호
            </label>
            <input
              id="phone"
              name="phone"
              defaultValue={profile.phone ?? ''}
              placeholder="01012345678"
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-1"
            />
          </div>
        </div>

        {state && !state.success && (
          <p className="font-ui text-error mt-3 text-sm">{state.error}</p>
        )}
        {state?.success && (
          <p className="font-ui text-success mt-3 text-sm">프로필이 수정되었습니다.</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="font-ui bg-charcoal mt-4 h-9 rounded-lg px-5 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </form>

      {/* Deactivate */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleDeactivate}
          className="font-ui text-xs text-red-400 transition-colors hover:text-red-600"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
