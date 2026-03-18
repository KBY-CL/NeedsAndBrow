'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthResult } from '@/lib/domain/auth/types';

const TimeSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, '올바른 시간 형식이 아닙니다 (HH:MM).'),
  maxReservations: z.coerce.number().min(1).max(10),
  sortOrder: z.coerce.number().default(0),
});

export async function createTimeSlot(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = TimeSlotSchema.safeParse({
    time: formData.get('time'),
    maxReservations: formData.get('maxReservations'),
    sortOrder: formData.get('sortOrder') || 0,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.from('time_slots').insert({
    time: parsed.data.time,
    max_reservations: parsed.data.maxReservations,
    sort_order: parsed.data.sortOrder,
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: '이미 존재하는 시간입니다.' };
    return { success: false, error: '시간 슬롯 등록에 실패했습니다.' };
  }

  revalidatePath('/admin/time-slots');
  return { success: true, data: undefined };
}

export async function toggleTimeSlotActive(id: string, isActive: boolean): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('time_slots').update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/admin/time-slots');
  return { success: true, data: undefined };
}

export async function deleteTimeSlot(id: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('time_slots').delete().eq('id', id);
  if (error) return { success: false, error: '삭제에 실패했습니다.' };

  revalidatePath('/admin/time-slots');
  return { success: true, data: undefined };
}

export async function getAllTimeSlots() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('time_slots').select('*').order('sort_order');
  return data ?? [];
}

// ─── 마감일 관리 ────────────────────────────────────────────

export async function addBlockedDate(date: string, reason?: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('blocked_dates').insert({
    date,
    reason: reason || null,
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: '이미 마감 처리된 날짜입니다.' };
    return { success: false, error: '마감일 등록에 실패했습니다.' };
  }

  revalidatePath('/admin/time-slots');
  return { success: true, data: undefined };
}

export async function removeBlockedDate(id: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
  if (error) return { success: false, error: '마감일 해제에 실패했습니다.' };

  revalidatePath('/admin/time-slots');
  return { success: true, data: undefined };
}

export async function getBlockedDates() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('blocked_dates').select('*').order('date');
  return data ?? [];
}
