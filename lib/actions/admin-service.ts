'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';

const ServiceSchema = z.object({
  name: z.string().min(1, '서비스명을 입력하세요.').max(50),
  category: z.enum(['이벤트', '속눈썹연장', '속눈썹펌', '왁싱', '눈썹문신', '기타']),
  description: z.string().max(200).optional().or(z.literal('')),
  duration: z.coerce.number().min(10).max(300),
  price: z.coerce.number().min(0),
  sortOrder: z.coerce.number().default(0),
});

export async function createService(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = ServiceSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || '',
    duration: formData.get('duration'),
    price: formData.get('price'),
    sortOrder: formData.get('sortOrder') || 0,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const { error } = await supabase.from('services').insert({
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description || null,
    duration: parsed.data.duration,
    price: parsed.data.price,
    sort_order: parsed.data.sortOrder,
  });

  if (error) return { success: false, error: '서비스 등록에 실패했습니다.' };

  revalidatePath('/admin/services');
  return { success: true, data: undefined };
}

export async function updateService(
  id: string,
  _: unknown,
  formData: FormData,
): Promise<AuthResult> {
  const parsed = ServiceSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || '',
    duration: formData.get('duration'),
    price: formData.get('price'),
    sortOrder: formData.get('sortOrder') || 0,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const { error } = await supabase
    .from('services')
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      description: parsed.data.description || null,
      duration: parsed.data.duration,
      price: parsed.data.price,
      sort_order: parsed.data.sortOrder,
    })
    .eq('id', id);

  if (error) return { success: false, error: '서비스 수정에 실패했습니다.' };

  revalidatePath('/admin/services');
  return { success: true, data: undefined };
}

export async function toggleServiceActive(id: string, isActive: boolean): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const { error } = await supabase.from('services').update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/admin/services');
  return { success: true, data: undefined };
}

export async function deleteService(id: string): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      return {
        success: false,
        error: '예약 내역이 있어 삭제할 수 없습니다. 비활성화를 사용하세요.',
      };
    }
    return { success: false, error: '서비스 삭제에 실패했습니다.' };
  }

  revalidatePath('/admin/services');
  return { success: true, data: undefined };
}

export async function getAllServices() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('services').select('*').order('sort_order');
  return data ?? [];
}
