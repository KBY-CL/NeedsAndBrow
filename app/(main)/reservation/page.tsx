import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { ReservationForm } from '@/components/domain/reservation/ReservationForm';

export const metadata: Metadata = {
  title: '예약하기',
  description: '속눈썹 연장, 반영구 시술 예약',
};

export default async function ReservationPage() {
  const supabase = await createServerClient();

  const [{ data: services }, { data: blockedDates }] = await Promise.all([
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .order('sort_order'),
    supabase.from('blocked_dates').select('date'),
  ]);

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-charcoal text-2xl">예약하기</h1>
        <p className="font-ui text-gray mt-2 text-sm">원하시는 시술과 날짜를 선택해 주세요.</p>
      </div>

      <ReservationForm
        services={services ?? []}
        blockedDates={blockedDates?.map((d) => d.date) ?? []}
      />
    </div>
  );
}
