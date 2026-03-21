'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthResult } from '@/lib/domain/auth/types';

const ProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.').max(20),
  phone: z
    .string()
    .regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.')
    .optional()
    .or(z.literal('')),
});

export async function updateProfile(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = ProfileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('profiles')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
    })
    .eq('id', user.id);

  if (error) return { success: false, error: '프로필 수정에 실패했습니다.' };

  revalidatePath('/mypage');
  return { success: true, data: undefined };
}

export async function savePhone(phone: string): Promise<AuthResult> {
  const cleaned = phone.replace(/-/g, '');
  if (!/^01[0-9]{8,9}$/.test(cleaned)) {
    return { success: false, error: '올바른 휴대폰 번호 형식이 아닙니다.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { error } = await supabase.from('profiles').update({ phone: cleaned }).eq('id', user.id);

  if (error) return { success: false, error: '연락처 저장에 실패했습니다.' };

  revalidatePath('/reservation');
  revalidatePath('/mypage');
  return { success: true, data: undefined };
}

export async function deactivateAccount(): Promise<AuthResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('profiles')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { success: false, error: '탈퇴 처리에 실패했습니다.' };

  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true, data: undefined };
}
