import type { Metadata } from 'next';
import { getAllGalleryItems } from '@/lib/actions/gallery';
import { AdminGalleryList } from './AdminGalleryList';

export const metadata: Metadata = { title: '갤러리 관리' };

export default async function AdminGalleryPage() {
  const items = await getAllGalleryItems();

  return (
    <div>
      <h1 className="font-display text-charcoal mb-6 text-2xl">갤러리 관리</h1>
      <AdminGalleryList initialItems={items} />
    </div>
  );
}
