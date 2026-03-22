import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/actions/utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminMemberTable } from './AdminMemberTable';

export const metadata: Metadata = { title: '회원 관리' };

export default async function AdminMembersPage() {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) {
    return <p className="font-ui text-gray py-12 text-center">접근 권한이 없습니다.</p>;
  }

  // 프로필은 로그인 세션으로 조회 (RLS 통과)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // auth 데이터는 service role로 조회 (이메일, 최근 로그인)
  let authUsers: Array<{ id: string; email?: string; last_sign_in_at?: string }> = [];
  try {
    const admin = createAdminClient();
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    authUsers = authData?.users ?? [];
  } catch {
    // service role key 없으면 auth 데이터 없이 진행
  }

  const members = (profiles ?? []).map((profile) => {
    const authUser = authUsers.find((u) => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
    };
  });

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">회원 관리</h1>
      <AdminMemberTable members={members} />
    </div>
  );
}
