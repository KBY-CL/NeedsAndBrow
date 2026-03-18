import type { Metadata } from 'next';
import { getAllServices } from '@/lib/actions/admin-service';
import { AdminServiceList } from './AdminServiceList';

export const metadata: Metadata = {
  title: '서비스 관리',
};

export default async function AdminServicesPage() {
  const services = await getAllServices();

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">서비스 관리</h1>
      <AdminServiceList initialServices={services} />
    </div>
  );
}
