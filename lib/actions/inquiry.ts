'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthResult } from '@/lib/domain/auth/types';

const InquirySchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.').max(100),
  content: z.string().min(1, '내용을 입력하세요.').max(2000),
  password: z
    .string()
    .min(4, '비밀번호는 4자 이상이어야 합니다.')
    .max(20)
    .optional()
    .or(z.literal('')),
});

export async function createInquiry(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = InquirySchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    password: formData.get('password') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비밀번호를 간단 해시 (실제 프로덕션에서는 bcrypt 사용)
  const passwordHash = parsed.data.password ? btoa(parsed.data.password) : null;

  const { error } = await supabase.from('inquiries').insert({
    user_id: user?.id ?? null,
    title: parsed.data.title,
    content: parsed.data.content,
    password_hash: passwordHash,
  });

  if (error) return { success: false, error: '문의 등록에 실패했습니다.' };

  revalidatePath('/inquiry');
  return { success: true, data: undefined };
}

export async function verifyInquiryPassword(
  inquiryId: string,
  password: string,
): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('inquiries')
    .select('password_hash')
    .eq('id', inquiryId)
    .single();

  if (!data) return { success: false, error: '문의를 찾을 수 없습니다.' };

  if (!data.password_hash) {
    return { success: true, data: undefined };
  }

  const inputHash = btoa(password);
  if (inputHash !== data.password_hash) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  return { success: true, data: undefined };
}

export async function answerInquiry(inquiryId: string, answer: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('inquiries')
    .update({
      answer,
      answered_at: new Date().toISOString(),
      status: 'answered',
    })
    .eq('id', inquiryId);

  if (error) return { success: false, error: '답변 등록에 실패했습니다.' };

  revalidatePath('/inquiry');
  revalidatePath('/admin/inquiries');
  return { success: true, data: undefined };
}

export async function getInquiries() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('inquiries')
    .select('id, title, status, created_at, user_id, password_hash')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getInquiryById(id: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*, profile:profiles(name)')
    .eq('id', id)
    .single();
  return data;
}

export async function getAllInquiriesAdmin() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*, profile:profiles(name)')
    .order('created_at', { ascending: false });
  return data ?? [];
}
