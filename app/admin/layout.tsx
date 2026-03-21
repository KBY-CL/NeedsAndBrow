import type { Metadata } from 'next';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export const metadata: Metadata = {
  title: '관리자',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="bg-cream-dark flex-1 overflow-y-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-screen-lg px-4 py-4 md:px-6 md:py-6">{children}</div>
      </main>
    </div>
  );
}
