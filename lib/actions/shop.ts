'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function getShopInfo() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('shop_info').select('*').eq('id', 1).single();
  return data;
}
