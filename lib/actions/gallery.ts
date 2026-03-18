'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthResult } from '@/lib/domain/auth/types';
import type { ServiceCategory } from '@/types/database.types';

const GallerySchema = z.object({
  category: z.enum(['속눈썹연장', '눈썹문신', '기타']),
  beforeUrl: z.string().url(),
  afterUrl: z.string().url(),
  description: z.string().max(200).optional().or(z.literal('')),
  sortOrder: z.coerce.number().default(0),
});

export async function createGalleryItem(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = GallerySchema.safeParse({
    category: formData.get('category'),
    beforeUrl: formData.get('beforeUrl'),
    afterUrl: formData.get('afterUrl'),
    description: formData.get('description') || '',
    sortOrder: formData.get('sortOrder') || 0,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from('gallery').insert({
    category: parsed.data.category,
    before_url: parsed.data.beforeUrl,
    after_url: parsed.data.afterUrl,
    description: parsed.data.description || null,
    sort_order: parsed.data.sortOrder,
  });

  if (error) return { success: false, error: '갤러리 등록에 실패했습니다.' };

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  return { success: true, data: undefined };
}

export async function toggleGalleryVisibility(id: string, isVisible: boolean): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('gallery').update({ is_visible: isVisible }).eq('id', id);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  return { success: true, data: undefined };
}

export async function deleteGalleryItem(id: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  if (error) return { success: false, error: '삭제에 실패했습니다.' };

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  return { success: true, data: undefined };
}

export async function getGalleryItems(category?: ServiceCategory) {
  const supabase = await createServerClient();
  let query = supabase.from('gallery').select('*').eq('is_visible', true).order('sort_order');

  if (category) {
    query = query.eq('category', category);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getAllGalleryItems() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('gallery').select('*').order('sort_order');
  return data ?? [];
}
