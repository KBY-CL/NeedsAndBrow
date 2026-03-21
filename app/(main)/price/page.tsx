import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import type { ServiceCategory } from '@/types/database.types';

export const metadata: Metadata = {
  title: '가격표',
  description: '시술 서비스별 가격 안내',
};

const categoryLabel: Record<ServiceCategory, string> = {
  이벤트: '이벤트',
  속눈썹연장: '속눈썹 연장',
  속눈썹펌: '속눈썹 펌',
  왁싱: '페이스 왁싱',
  눈썹문신: '눈썹 문신',
  기타: '기타',
};

export default async function PricePage() {
  const supabase = await createServerClient();
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const grouped = (services ?? []).reduce<Record<ServiceCategory, typeof services>>(
    (acc, svc) => {
      if (!acc[svc.category]) acc[svc.category] = [];
      acc[svc.category]!.push(svc);
      return acc;
    },
    { 이벤트: [], 속눈썹연장: [], 속눈썹펌: [], 왁싱: [], 눈썹문신: [], 기타: [] },
  );

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-charcoal text-2xl">가격표</h1>
        <p className="font-ui text-gray mt-2 text-sm">시술별 가격을 확인하세요.</p>
      </div>

      <div className="space-y-8">
        {(Object.entries(grouped) as [ServiceCategory, typeof services][])
          .filter(([, items]) => items && items.length > 0)
          .map(([category, items]) => (
            <section key={category}>
              <h2 className="font-ui text-charcoal mb-4 text-lg font-semibold">
                {categoryLabel[category]}
              </h2>
              <div className="border-gray-light shadow-soft overflow-hidden rounded-xl border bg-white">
                {items!.map((service, i) => (
                  <div
                    key={service.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i > 0 ? 'border-gray-light border-t' : ''
                    }`}
                  >
                    <div>
                      <p className="font-ui text-charcoal text-sm font-medium">{service.name}</p>
                      {service.description && (
                        <p className="font-ui text-gray mt-0.5 text-xs">{service.description}</p>
                      )}
                      {service.duration > 0 && (
                        <p className="font-ui text-gray mt-0.5 text-xs">{service.duration}분</p>
                      )}
                    </div>
                    <span className="font-ui text-charcoal text-sm font-semibold">
                      {service.price === 0 ? '가격 문의' : `${service.price.toLocaleString()}원`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/reservation"
          className="font-ui bg-gold hover:bg-gold-dark inline-flex h-12 items-center gap-2 rounded-lg px-8 text-sm font-medium text-white transition-colors"
        >
          <CalendarDays size={16} strokeWidth={1.5} />
          예약하기
        </Link>
      </div>
    </div>
  );
}
