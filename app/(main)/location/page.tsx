import type { Metadata } from 'next';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { getShopInfo } from '@/lib/queries/shop';
import { KakaoMap } from '@/components/domain/location/KakaoMap';

export const metadata: Metadata = {
  title: '오시는 길',
  description: 'Needs Ann Brow 매장 위치 안내',
};

export default async function LocationPage() {
  const shop = await getShopInfo();

  const hoursText = (shop?.hours as Record<string, string> | null)?._text ?? '';

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-charcoal text-2xl">오시는 길</h1>
        <p className="font-ui text-gray mt-2 text-sm">Needs Ann Brow 매장 안내</p>
      </div>

      {/* Map */}
      {shop?.address && process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ? (
        <KakaoMap
          address={shop.address}
          name={shop.name}
          appKey={process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}
        />
      ) : (
        <div className="bg-cream border-gray-light mb-8 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border">
          <div className="text-center">
            <MapPin size={32} strokeWidth={1.5} className="text-gold mx-auto mb-2" />
            <p className="font-ui text-gray text-sm">주소가 등록되지 않았습니다.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shop Info */}
        <div className="border-gray-light shadow-soft rounded-xl border bg-white p-6">
          <h2 className="font-ui text-charcoal mb-4 text-lg font-semibold">매장 정보</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin size={18} strokeWidth={1.5} className="text-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-ui text-charcoal text-sm font-medium">주소</p>
                <p className="font-ui text-charcoal-light text-sm">
                  {shop?.address || '주소 미등록'}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={18} strokeWidth={1.5} className="text-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-ui text-charcoal text-sm font-medium">전화</p>
                <p className="font-ui text-charcoal-light text-sm">
                  {shop?.phone ? (
                    <a href={`tel:${shop.phone}`} className="hover:text-gold transition-colors">
                      {shop.phone}
                    </a>
                  ) : (
                    '전화번호 미등록'
                  )}
                </p>
              </div>
            </li>
            {shop?.parking_info && (
              <li className="flex items-start gap-3">
                <Navigation size={18} strokeWidth={1.5} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-ui text-charcoal text-sm font-medium">위치 안내</p>
                  <p className="font-ui text-charcoal-light text-sm">{shop.parking_info}</p>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Hours */}
        <div className="border-gray-light shadow-soft rounded-xl border bg-white p-6">
          <h2 className="font-ui text-charcoal mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock size={18} strokeWidth={1.5} className="text-gold" />
            운영 시간
          </h2>
          {hoursText ? (
            <p className="font-ui text-charcoal-light text-sm whitespace-pre-line">{hoursText}</p>
          ) : (
            <p className="font-ui text-gray text-sm">운영 시간 미등록</p>
          )}
        </div>
      </div>
    </div>
  );
}
