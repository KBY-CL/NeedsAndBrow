'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthResult } from '@/lib/domain/auth/types';

// ─── 관리자: 예약 목록 조회 (날짜별) ────────────────────────

export async function getReservationsByDate(date: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('reservations')
    .select('*, service:services(name, category, duration, price), profile:profiles(name, phone)')
    .eq('date', date)
    .order('time_slot');

  return data ?? [];
}

// ─── 관리자: 예약 확정 ──────────────────────────────────────

export async function confirmReservation(
  reservationId: string,
  adminNote?: string,
): Promise<AuthResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc('confirm_reservation', {
    p_reservation_id: reservationId,
    p_admin_note: adminNote,
  });

  if (error) return { success: false, error: '예약 확정에 실패했습니다.' };

  revalidatePath('/admin/reservations');
  return { success: true, data: undefined };
}

// ─── 관리자: 예약 거절 ──────────────────────────────────────

export async function rejectReservation(
  reservationId: string,
  adminNote?: string,
): Promise<AuthResult> {
  const supabase = await createServerClient();

  const { error } = await supabase.rpc('reject_reservation', {
    p_reservation_id: reservationId,
    p_admin_note: adminNote,
  });

  if (error) return { success: false, error: '예약 거절에 실패했습니다.' };

  revalidatePath('/admin/reservations');
  return { success: true, data: undefined };
}
