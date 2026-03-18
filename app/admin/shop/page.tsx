import type { Metadata } from 'next';
import { getShopInfo } from '@/lib/actions/shop';

export const metadata: Metadata = { title: '매장 정보 관리' };

export default async function AdminShopPage() {
  const shop = await getShopInfo();

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">매장 정보 관리</h1>

      <div className="border-gray-light shadow-soft rounded-xl border bg-white p-6">
        <p className="font-ui text-gray text-sm">매장 정보 수정 기능은 추후 구현 예정입니다.</p>
        {shop && (
          <div className="font-ui text-charcoal-light mt-4 space-y-2 text-sm">
            <p>
              <strong>매장명:</strong> {shop.name}
            </p>
            <p>
              <strong>주소:</strong> {shop.address || '미등록'}
            </p>
            <p>
              <strong>전화:</strong> {shop.phone || '미등록'}
            </p>
            <p>
              <strong>카카오:</strong> {shop.kakao_url || '미등록'}
            </p>
            <p>
              <strong>인스타그램:</strong> {shop.instagram_url || '미등록'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
