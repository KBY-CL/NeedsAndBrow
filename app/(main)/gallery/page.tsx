import type { Metadata } from 'next';
import { getGalleryItems } from '@/lib/actions/gallery';
import { GalleryGrid } from './GalleryGrid';

export const metadata: Metadata = {
  title: 'Before & After',
  description: '속눈썹 연장, 반영구 시술 Before & After',
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-charcoal text-2xl">Before &amp; After</h1>
        <p className="font-ui text-gray mt-2 text-sm">시술 전후 변화를 확인하세요.</p>
      </div>
      <GalleryGrid initialItems={items} />
    </div>
  );
}
