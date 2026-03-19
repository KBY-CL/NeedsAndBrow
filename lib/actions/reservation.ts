'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { isValidReservationDate } from '@/lib/domain/reservation/rules';
import type { AuthResult } from '@/lib/domain/auth/types';
import type { ReservationWithDetails, AvailableSlot } from '@/lib/domain/reservation/types';
import { sendTelegramNotification } from '@/lib/services/telegram';

// ─── Zod 스키마 ─────────────────────────────────────────────

const CreateReservationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, '올바른 시간 형식이 아닙니다.'),
  serviceId: z.string().uuid('올바른 서비스 ID가 아닙니다.'),
  userNote: z.string().max(500, '메모는 500자 이내여야 합니다.').optional().or(z.literal('')),
});

// ─── 예약 생성 ──────────────────────────────────────────────

export async function createReservation(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = CreateReservationSchema.safeParse({
    date: formData.get('date'),
    timeSlot: formData.get('timeSlot'),
    serviceId: formData.get('serviceId'),
    userNote: formData.get('userNote') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  // 인증 확인
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  // 날짜 유효성
  const dateRule = isValidReservationDate(parsed.data.date);
  if (!dateRule.ok) return { success: false, error: dateRule.reason };

  // 마감일 체크
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', parsed.data.date)
    .maybeSingle();
  if (blocked) return { success: false, error: '해당 날짜는 예약이 마감되었습니다.' };

  // 슬롯 잔여 확인
  const { data: slot } = await supabase
    .from('time_slots')
    .select('max_reservations')
    .eq('time', parsed.data.timeSlot)
    .eq('is_active', true)
    .maybeSingle();
  if (!slot) return { success: false, error: '해당 시간은 예약할 수 없습니다.' };

  const { count } = await supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('date', parsed.data.date)
    .eq('time_slot', parsed.data.timeSlot)
    .in('status', ['pending', 'confirmed']);
  if ((count ?? 0) >= slot.max_reservations) {
    return { success: false, error: '해당 시간대의 예약이 마감되었습니다.' };
  }

  // 저장
  const { error } = await supabase.from('reservations').insert({
    user_id: user.id,
    service_id: parsed.data.serviceId,
    date: parsed.data.date,
    time_slot: parsed.data.timeSlot,
    user_note: parsed.data.userNote || null,
    status: 'pending',
  });

  if (error) return { success: false, error: '예약에 실패했습니다. 다시 시도해 주세요.' };

  // 알림에 필요한 추가 정보 조회
  const [{ data: service }, { data: profile }] = await Promise.all([
    supabase.from('services').select('name').eq('id', parsed.data.serviceId).single(),
    supabase.from('profiles').select('name').eq('id', user.id).single(),
  ]);

  // Telegram 알림 (비동기, 실패해도 예약은 유지)
  sendTelegramNotification('new_reservation', {
    date: parsed.data.date,
    time_slot: parsed.data.timeSlot,
    service_name: service?.name,
    user_name: profile?.name ?? user.email,
    user_note: parsed.data.userNote,
  }).catch((err) => console.error('[Telegram] reservation notification failed:', err));

  revalidatePath('/reservation');
  revalidatePath('/mypage');
  return { success: true, data: undefined };
}

// ─── 예약 취소 ──────────────────────────────────────────────

export async function cancelReservation(reservationId: string): Promise<AuthResult> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: '로그인이 필요합니다.' };

  // 취소 전 예약 정보 조회 (알림용)
  const { data: reservation } = await supabase
    .from('reservations')
    .select('date, time_slot, service:services(name)')
    .eq('id', reservationId)
    .single();

  try {
    await supabase.rpc('cancel_reservation', { p_reservation_id: reservationId });
  } catch {
    return { success: false, error: '예약 취소에 실패했습니다. 2시간 전까지만 취소 가능합니다.' };
  }

  // Telegram 알림
  if (reservation) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const service = reservation.service as { name: string } | null;
    sendTelegramNotification('cancel_reservation', {
      date: reservation.date,
      time_slot: reservation.time_slot,
      service_name: service?.name,
      user_name: profile?.name ?? user.email,
    }).catch((err) => console.error('[Telegram] cancel notification failed:', err));
  }

  revalidatePath('/reservation');
  revalidatePath('/mypage');
  return { success: true, data: undefined };
}

// ─── 내 예약 목록 ───────────────────────────────────────────

export async function getMyReservations(): Promise<ReservationWithDetails[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('reservations')
    .select('*, service:services(name, category, duration, price)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('time_slot', { ascending: false });

  return (data ?? []) as unknown as ReservationWithDetails[];
}

// ─── 서비스 목록 ────────────────────────────────────────────

export async function getActiveServices() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

// ─── 특정 날짜 이용 가능 슬롯 ───────────────────────────────

export async function getAvailableSlots(date: string): Promise<AvailableSlot[]> {
  const supabase = await createServerClient();

  // 마감일 체크
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', date)
    .maybeSingle();
  if (blocked) return [];

  // 전체 활성 슬롯
  const { data: slots } = await supabase
    .from('time_slots')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (!slots?.length) return [];

  // 해당 날짜 예약 수 조회
  const { data: reservations } = await supabase
    .from('reservations')
    .select('time_slot')
    .eq('date', date)
    .in('status', ['pending', 'confirmed']);

  const countBySlot = new Map<string, number>();
  reservations?.forEach((r) => {
    countBySlot.set(r.time_slot, (countBySlot.get(r.time_slot) ?? 0) + 1);
  });

  return slots.map((slot) => ({
    ...slot,
    remainingCapacity: slot.max_reservations - (countBySlot.get(slot.time) ?? 0),
  }));
}
