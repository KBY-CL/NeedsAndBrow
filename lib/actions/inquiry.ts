'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';
import { sendTelegramNotification } from '@/lib/services/telegram';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

const InquirySchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.').max(100),
  content: z.string().min(1, '내용을 입력하세요.').max(2000),
  contact_phone: z.string().min(1, '연락처를 입력하세요.').max(20),
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
    contact_phone: formData.get('contact_phone'),
    password: formData.get('password') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 비밀번호 해싱 (SHA-256)
  const passwordHash = parsed.data.password ? hashPassword(parsed.data.password) : null;

  const { error } = await supabase.from('inquiries').insert({
    user_id: user?.id ?? null,
    title: parsed.data.title,
    content: parsed.data.content,
    contact_phone: parsed.data.contact_phone,
    password_hash: passwordHash,
  });

  if (error) return { success: false, error: '문의 등록에 실패했습니다.' };

  // 사용자 이름 조회
  let userName = '비회원';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    userName = profile?.name ?? user.email ?? '회원';
  }

  // Telegram 알림
  await sendTelegramNotification('new_inquiry', {
    title: parsed.data.title,
    user_name: userName,
    contact_phone: parsed.data.contact_phone,
  }).catch((err) => console.error('[Telegram] inquiry notification failed:', err));

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

  const inputHash = hashPassword(password);
  if (inputHash !== data.password_hash) {
    return { success: false, error: '비밀번호가 일치하지 않습니다.' };
  }

  return { success: true, data: undefined };
}

async function verifyOwnership(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  inquiryId: string,
  password: string | null,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('inquiries')
    .select('user_id, password_hash')
    .eq('id', inquiryId)
    .single();

  if (!data) return false;

  // 로그인 사용자 본인 확인
  if (user && data.user_id === user.id) return true;

  // 비밀번호 확인
  if (password && data.password_hash) {
    return hashPassword(password) === data.password_hash;
  }

  // 비밀번호 없는 문의는 누구나 수정 가능 (로그인 없이 작성한 공개 문의)
  if (!data.password_hash && !data.user_id) return true;

  return false;
}

export async function updateInquiry(
  inquiryId: string,
  password: string | null,
  _: unknown,
  formData: FormData,
): Promise<AuthResult> {
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!title) return { success: false, error: '제목을 입력하세요.' };
  if (!content) return { success: false, error: '내용을 입력하세요.' };

  const supabase = await createServerClient();

  if (!(await verifyOwnership(supabase, inquiryId, password))) {
    return { success: false, error: '수정 권한이 없습니다.' };
  }

  const { error } = await supabase.from('inquiries').update({ title, content }).eq('id', inquiryId);

  if (error) return { success: false, error: '수정에 실패했습니다.' };

  revalidatePath(`/inquiry/${inquiryId}`);
  revalidatePath('/inquiry');
  return { success: true, data: undefined };
}

export async function deleteInquiry(
  inquiryId: string,
  password: string | null,
): Promise<AuthResult> {
  const supabase = await createServerClient();

  if (!(await verifyOwnership(supabase, inquiryId, password))) {
    return { success: false, error: '삭제 권한이 없습니다.' };
  }

  const { error } = await supabase.from('inquiries').delete().eq('id', inquiryId);

  if (error) return { success: false, error: '삭제에 실패했습니다.' };

  revalidatePath('/inquiry');
  return { success: true, data: undefined };
}

export async function answerInquiry(inquiryId: string, answer: string): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
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

  // password_hash 값 자체를 노출하지 않고 존재 여부만 반환
  return (data ?? []).map(({ password_hash, ...rest }) => ({
    ...rest,
    has_password: !!password_hash,
  }));
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
