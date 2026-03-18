import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '인증',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cream flex min-h-screen flex-col">
      {/* 로고 */}
      <header className="px-4 py-6 text-center">
        <Link href="/" className="inline-block">
          <span className="font-display text-charcoal text-xl tracking-wider">
            Beauty Lash &amp; Brow
          </span>
        </Link>
      </header>

      {/* 폼 영역 */}
      <main className="flex flex-1 items-center justify-center px-4 pb-16">{children}</main>
    </div>
  );
}
