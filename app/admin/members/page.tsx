import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/actions/utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminMemberTable } from './AdminMemberTable';

export const metadata: Metadata = { title: '회원 관리' };

export default async function AdminMembersPage() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return <p className="font-ui text-gray py-12 text-center">접근 권한이 없습니다.</p>;
  }

  const admin = createAdminClient();

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const authUsers = authData?.users ?? [];

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
