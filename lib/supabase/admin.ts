import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// 서버에서만 사용. 절대 클라이언트 번들에 포함되지 않도록 주의.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
