'use server';

import { requireAdmin } from '@/lib/actions/utils';
import { format } from 'date-fns';

export async function getDashboardData() {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return null;

  const today = format(new Date(), 'yyyy-MM-dd');

  const [
    { data: todayReservations },
    { data: pendingReservations },
    { data: unansweredInquiries },
    { data: recentMembers },
    { data: recentReviews },
  ] = await Promise.all([
    // 오늘 예약 (시간순)
    supabase
      .from('reservations')
      .select(
        'id, date, time_slot, status, user_note, admin_note, service:services(name, category, duration), profile:profiles(name, phone)',
      )
      .eq('date', today)
      .order('time_slot'),

    // 확인 대기 예약 (전체 기간)
    supabase
      .from('reservations')
      .select('id, date, time_slot, status, service:services(name), profile:profiles(name, phone)')
      .eq('status', 'pending')
      .gte('date', today)
      .order('date')
      .order('time_slot'),

    // 미답변 문의
    supabase
      .from('inquiries')
      .select('id, title, contact_phone, created_at, profile:profiles(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),

    // 최근 가입 회원 (7일)
    supabase
      .from('profiles')
      .select('id, name, phone, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(5),

    // 최근 후기 (5건)
    supabase
      .from('reviews')
      .select('id, title, created_at, profile:profiles(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const todayList = todayReservations ?? [];

  return {
    today,
    stats: {
      todayTotal: todayList.length,
      todayPending: todayList.filter((r) => r.status === 'pending').length,
      todayConfirmed: todayList.filter((r) => r.status === 'confirmed').length,
      unansweredInquiries: unansweredInquiries?.length ?? 0,
      newMembers: recentMembers?.length ?? 0,
    },
    todayReservations: todayList,
    pendingReservations: pendingReservations ?? [],
    unansweredInquiries: unansweredInquiries ?? [],
    recentMembers: recentMembers ?? [],
    recentReviews: recentReviews ?? [],
  };
}
