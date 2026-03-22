import type { Metadata } from 'next';
import { getShopInfo } from '@/lib/actions/shop';
import { ShopEditForm } from './ShopEditForm';

export const metadata: Metadata = { title: '매장 정보 관리' };

export default async function AdminShopPage() {
  const shop = await getShopInfo();

  if (!shop) {
    return (
      <div>
        <h1 className="font-display text-charcoal mb-6 text-2xl">매장 정보 관리</h1>
        <p className="font-ui text-gray text-sm">매장 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">매장 정보 관리</h1>
      <div className="border-gray-light shadow-soft rounded-xl border bg-white p-6">
        <ShopEditForm
          shop={{
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            parking_info: shop.parking_info,
            kakao_url: shop.kakao_url,
            instagram_url: shop.instagram_url,
            hours: (shop.hours ?? {}) as Record<string, string>,
          }}
        />
      </div>

      <div className="font-ui text-gray mt-4 text-xs">
        <p>수정 시 반영되는 곳:</p>
        <ul className="mt-1 list-inside list-disc">
          <li>오시는 길 페이지 (/location)</li>
          <li>하단 푸터 (매장 정보)</li>
        </ul>
      </div>
    </div>
  );
}
