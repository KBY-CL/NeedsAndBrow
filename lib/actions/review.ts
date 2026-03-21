'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';

const ReviewSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.').max(50, '50자 이내로 입력하세요.'),
  content: z.string().min(10, '10자 이상 작성하세요.').max(2000, '2000자 이내로 입력하세요.'),
  images: z.string().optional(), // JSON string array of URLs
});

export async function createReview(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = ReviewSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    images: formData.get('images') || '[]',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  let images: string[] = [];
  try {
    images = JSON.parse(parsed.data.images ?? '[]');
  } catch {
    // ignore parse error
  }

  const { error } = await supabase.from('reviews').insert({
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
    images,
  });

  if (error) return { success: false, error: '후기 작성에 실패했습니다.' };

  revalidatePath('/reviews');
  return { success: true, data: undefined };
}

export async function updateReview(
  reviewId: string,
  _: unknown,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = ReviewSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    images: formData.get('images') || '[]',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  let images: string[] = [];
  try {
    images = JSON.parse(parsed.data.images ?? '[]');
  } catch {
    // ignore
  }

  const { error } = await supabase
    .from('reviews')
    .update({
      title: parsed.data.title,
      content: parsed.data.content,
      images,
    })
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) return { success: false, error: '수정에 실패했습니다.' };

  revalidatePath('/reviews');
  revalidatePath(`/reviews/${reviewId}`);
  return { success: true, data: undefined };
}

export async function deleteReview(reviewId: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  // Allow owner or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  let deleteQuery = supabase.from('reviews').delete().eq('id', reviewId);
  if (profile?.role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', user.id);
  }

  const { error } = await deleteQuery;
  if (error) return { success: false, error: '삭제에 실패했습니다.' };

  revalidatePath('/reviews');
  return { success: true, data: undefined };
}

export async function toggleOfficialReview(
  reviewId: string,
  isOfficial: boolean,
): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
  const { error } = await supabase
    .from('reviews')
    .update({ is_official: isOfficial })
    .eq('id', reviewId);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/reviews');
  return { success: true, data: undefined };
}

export async function getReviews() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, profile:profiles(name, avatar_url)')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getReviewById(id: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('*, profile:profiles(name, avatar_url)')
    .eq('id', id)
    .single();
  return data;
}
