'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';
import type { Gallery, ServiceCategory } from '@/types/database.types';

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  file: File,
  prefix: string,
): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from('gallery').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) return null;

  const { data } = supabase.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}

export async function createGalleryItem(_: unknown, formData: FormData): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const category = formData.get('category') as Gallery['category'];
  const description = (formData.get('description') as string) || null;
  const beforeFile = formData.get('beforeFile') as File | null;
  const afterFile = formData.get('afterFile') as File | null;

  if (!category) return { success: false, error: '카테고리를 선택하세요.' };
  if (!beforeFile?.size) return { success: false, error: 'Before 이미지를 선택하세요.' };
  if (!afterFile?.size) return { success: false, error: 'After 이미지를 선택하세요.' };

  const [beforeUrl, afterUrl] = await Promise.all([
    uploadImage(supabase, beforeFile, 'before'),
    uploadImage(supabase, afterFile, 'after'),
  ]);

  if (!beforeUrl || !afterUrl) {
    return { success: false, error: '이미지 업로드에 실패했습니다.' };
  }

  const { error } = await supabase.from('gallery').insert({
    category,
    before_url: beforeUrl,
    after_url: afterUrl,
    description,
    sort_order: 0,
  });

  if (error) return { success: false, error: '등록에 실패했습니다.' };

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  return { success: true, data: undefined };
}

export async function toggleGalleryVisibility(id: string, isVisible: boolean): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
  const { error } = await supabase.from('gallery').update({ is_visible: isVisible }).eq('id', id);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
  return { success: true, data: undefined };
}

export async function deleteGalleryItem(id: string): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
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
