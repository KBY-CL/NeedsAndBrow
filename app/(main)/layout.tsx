import { Footer } from '@/components/layout/Footer';
import { MainLayoutShell } from './MainLayoutShell';
import { getShopInfo } from '@/lib/queries/shop';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const shop = await getShopInfo();

  const footerShop = shop
    ? {
        name: shop.name,
        phone: shop.phone,
        address: shop.address,
        hours_text: (shop.hours as Record<string, string> | null)?._text ?? '',
        naver_url: shop.kakao_url,
        instagram_url: shop.instagram_url,
      }
    : undefined;

  return (
    <div className="bg-cream flex min-h-screen flex-col">
      <MainLayoutShell>{children}</MainLayoutShell>
      <Footer shop={footerShop} />
    </div>
  );
}
