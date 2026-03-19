'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setProfile, setLoading, reset } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // 초기 세션 로드
    async function initAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data ?? null);
        }
      } catch (err) {
        console.error('[Auth] 초기화 실패:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        reset();
        return;
      }

      // JWT가 설정된 후 프로필 로드 (auth settle 대기)
      setTimeout(() => {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data ?? null));
      }, 100);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setProfile, setLoading, reset]);

  return <>{children}</>;
}
