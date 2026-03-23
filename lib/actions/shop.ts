'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/actions/utils';
import type { AuthResult } from '@/lib/domain/auth/types';

export async function updateShopInfo(_: unknown, formData: FormData): Promise<AuthResult> {
  const { supabase, authorized } = await requireAdmin();
  if (!authorized) return { success: false, error: '관리자 권한이 필요합니다.' };

  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const parkingInfo = String(formData.get('parking_info') ?? '').trim();
  const kakaoUrl = String(formData.get('kakao_url') ?? '').trim();
  const instagramUrl = String(formData.get('instagram_url') ?? '').trim();
  const daangnUrl = String(formData.get('daangn_url') ?? '').trim();
  const hoursText = String(formData.get('hours') ?? '').trim();

  if (!name) return { success: false, error: '매장명을 입력하세요.' };

  // 텍스트를 줄바꿈 기준으로 JSON 객체에 저장 (key: 줄번호, value: 텍스트)
  const hours: Record<string, string> = { _text: hoursText };

  const { error } = await supabase
    .from('shop_info')
    .update({
      name,
      address,
      phone,
      parking_info: parkingInfo || null,
      kakao_url: kakaoUrl || null,
      instagram_url: instagramUrl || null,
      daangn_url: daangnUrl || null,
      hours,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) return { success: false, error: '매장 정보 수정에 실패했습니다.' };

  revalidatePath('/admin/shop');
  revalidatePath('/location');
  revalidatePath('/', 'layout');
  return { success: true, data: undefined };
}
