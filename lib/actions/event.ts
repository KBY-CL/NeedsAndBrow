'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';

const EventSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.').max(100),
  content: z.string().min(1, '내용을 입력하세요.'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function createEvent(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = EventSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl') || '',
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const { error } = await supabase.from('events').insert({
    title: parsed.data.title,
    content: parsed.data.content,
    image_url: parsed.data.imageUrl || null,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
  });

  if (error) return { success: false, error: '이벤트 등록에 실패했습니다.' };

  revalidatePath('/events');
  revalidatePath('/admin/events');
  return { success: true, data: undefined };
}

export async function toggleEventActive(id: string, isActive: boolean): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
  const { error } = await supabase.from('events').update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: '상태 변경에 실패했습니다.' };

  revalidatePath('/events');
  revalidatePath('/admin/events');
  return { success: true, data: undefined };
}

export async function deleteEvent(id: string): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return { success: false, error: '삭제에 실패했습니다.' };

  revalidatePath('/events');
  revalidatePath('/admin/events');
  return { success: true, data: undefined };
}

function getEventStatus(startDate: string, endDate: string): '예정' | '진행중' | '종료' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate + 'T23:59:59');

  if (now < start) return '예정';
  if (now > end) return '종료';
  return '진행중';
}

export async function getActiveEvents() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: false });

  return (data ?? []).map((event) => ({
    ...event,
    status: getEventStatus(event.start_date, event.end_date),
  }));
}

export async function getAllEvents() {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });

  return (data ?? []).map((event) => ({
    ...event,
    status: getEventStatus(event.start_date, event.end_date),
  }));
}

export async function getEventById(id: string) {
  const supabase = await createServerClient();
  const { data } = await supabase.from('events').select('*').eq('id', id).single();
  if (!data) return null;
  return { ...data, status: getEventStatus(data.start_date, data.end_date) };
}
