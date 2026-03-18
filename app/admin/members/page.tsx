import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { AdminMemberList } from './AdminMemberList';

export const metadata: Metadata = { title: '회원 관리' };

export default async function AdminMembersPage() {
  const supabase = await createServerClient();
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">회원 관리</h1>
      <AdminMemberList initialMembers={members ?? []} />
    </div>
  );
}
