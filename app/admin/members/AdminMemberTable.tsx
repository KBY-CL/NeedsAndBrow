'use client';

import { useState } from 'react';
import { Shield, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile } from '@/types/database.types';

type MemberRow = Profile & {
  email: string | null;
  last_sign_in_at: string | null;
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminMemberTable({ members }: { members: MemberRow[] }) {
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.email?.toLowerCase().includes(q) ?? false) ||
      (m.phone?.includes(q) ?? false)
    );
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-ui text-gray shrink-0 text-sm">총 {filtered.length}명</p>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="text-gray absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름, 이메일, 연락처 검색"
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:ring-1"
          />
        </div>
      </div>

      {/* 모바일: 카드 형태 */}
      <div className="space-y-2 md:hidden">
        {filtered.map((m) => (
          <div
            key={m.id}
            className={cn(
              'border-gray-light shadow-soft rounded-xl border bg-white p-4',
              !m.is_active && 'opacity-50',
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="font-ui text-charcoal text-sm font-semibold">{m.name}</span>
              {m.role === 'admin' && <Shield size={13} className="text-gold-dark" />}
              {!m.is_active && (
                <span className="bg-error/20 text-error font-ui rounded-full px-2 py-0.5 text-[10px]">
                  비활성
                </span>
              )}
            </div>
            <div className="font-ui text-gray space-y-0.5 text-xs">
              <p>{m.email ?? '-'}</p>
              <p>{m.phone ?? '-'}</p>
              <p>가입: {formatDate(m.created_at)}</p>
              <p>최근 로그인: {formatDateTime(m.last_sign_in_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 데스크탑: 테이블 */}
      <div className="border-gray-light shadow-soft hidden overflow-hidden rounded-xl border bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-gray-light bg-cream/50 border-b">
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  이름
                </th>
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  이메일
                </th>
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  연락처
                </th>
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  가입일
                </th>
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  최근 로그인
                </th>
                <th className="font-ui text-charcoal px-4 py-3 text-left text-xs font-semibold">
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr
                  key={m.id}
                  className={cn(
                    i < filtered.length - 1 && 'border-gray-light border-b',
                    !m.is_active && 'opacity-50',
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-charcoal text-sm font-medium">{m.name}</span>
                      {m.role === 'admin' && <Shield size={13} className="text-gold-dark" />}
                    </div>
                  </td>
                  <td className="font-ui text-charcoal-light px-4 py-3 text-sm">
                    {m.email ?? '-'}
                  </td>
                  <td className="font-ui text-charcoal-light px-4 py-3 text-sm">
                    {m.phone ?? '-'}
                  </td>
                  <td className="font-ui text-gray px-4 py-3 text-sm">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="font-ui text-gray px-4 py-3 text-sm">
                    {formatDateTime(m.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3">
                    {!m.is_active ? (
                      <span className="bg-error/20 text-error font-ui rounded-full px-2 py-0.5 text-xs">
                        비활성
                      </span>
                    ) : (
                      <span className="bg-success/20 text-success font-ui rounded-full px-2 py-0.5 text-xs">
                        활성
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="font-ui text-gray py-8 text-center text-sm">
          {search ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
        </p>
      )}
    </div>
  );
}
