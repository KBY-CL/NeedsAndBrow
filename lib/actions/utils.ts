'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, authorized: false as const };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { supabase, authorized: false as const };

  return { supabase, authorized: true as const, user };
}
