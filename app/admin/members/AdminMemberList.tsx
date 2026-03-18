'use client';

import { User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

export function AdminMemberList({ initialMembers }: { initialMembers: Profile[] }) {
  return (
    <div>
      <p className="font-ui text-gray mb-4 text-sm">총 {initialMembers.length}명</p>

      <div className="space-y-2">
        {initialMembers.map((member) => (
          <div
            key={member.id}
            className={cn(
              'border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4',
              !member.is_active && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  member.role === 'admin' ? 'bg-gold/20' : 'bg-cream',
                )}
              >
                {member.role === 'admin' ? (
                  <Shield size={18} className="text-gold-dark" />
                ) : (
                  <User size={18} className="text-gray" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-ui text-charcoal text-sm font-semibold">{member.name}</span>
                  {member.role === 'admin' && (
                    <span className="bg-gold/20 text-gold-dark font-ui rounded-full px-2 py-0.5 text-[10px] font-medium">
                      관리자
                    </span>
                  )}
                  {!member.is_active && (
                    <span className="bg-error/20 text-error font-ui rounded-full px-2 py-0.5 text-[10px] font-medium">
                      비활성
                    </span>
                  )}
                </div>
                <p className="font-ui text-gray text-xs">
                  {member.phone ?? '-'} &middot;{' '}
                  {new Date(member.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        ))}
        {initialMembers.length === 0 && (
          <p className="font-ui text-gray py-8 text-center text-sm">등록된 회원이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
