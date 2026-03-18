import type { Metadata } from 'next';
import { Playfair_Display, Cormorant_Garamond, DM_Sans, Noto_Sans_KR } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-kr',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beauty-lash.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Beauty Lash & Brow',
    template: '%s | Beauty Lash & Brow',
  },
  description: '속눈썹 연장 및 반영구 시술 전문 매장 — 자연스러운 아름다움을 완성합니다.',
  keywords: ['속눈썹연장', '반영구', '눈썹문신', '뷰티', '강남', '속눈썹', '미용'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Beauty Lash & Brow',
    title: 'Beauty Lash & Brow',
    description: '속눈썹 연장 및 반영구 시술 전문 매장',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${playfairDisplay.variable} ${cormorantGaramond.variable} ${dmSans.variable} ${notoSansKR.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
