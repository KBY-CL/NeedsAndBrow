'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getGalleryItems } from '@/lib/actions/gallery';
import type { Gallery, ServiceCategory } from '@/types/database.types';

const categories: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '속눈썹연장', label: '속눈썹 연장' },
  { value: '눈썹문신', label: '눈썹 문신' },
  { value: '기타', label: '기타' },
];

interface GalleryGridProps {
  initialItems: Gallery[];
}

export function GalleryGrid({ initialItems }: GalleryGridProps) {
  const [items, setItems] = useState(initialItems);
  const [active, setActive] = useState<ServiceCategory | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  const handleFilter = (category: ServiceCategory | 'all') => {
    setActive(category);
    startTransition(async () => {
      const data = await getGalleryItems(category === 'all' ? undefined : category);
      setItems(data);
    });
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleFilter(value)}
            className={cn(
              'font-ui rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === value
                ? 'bg-charcoal text-white'
                : 'bg-gray-light text-charcoal-light hover:bg-cream-dark',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isPending ? (
        <div className="py-12 text-center">
          <div className="border-gold mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <p className="font-ui text-gray py-12 text-center text-sm">등록된 항목이 없습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-gray-light shadow-soft overflow-hidden rounded-xl border bg-white"
            >
              <div className="grid grid-cols-2">
                <div className="bg-cream relative aspect-square">
                  <Image
                    src={item.before_url}
                    alt="Before"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 170px"
                  />
                  <span className="font-ui absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                    Before
                  </span>
                </div>
                <div className="bg-cream relative aspect-square">
                  <Image
                    src={item.after_url}
                    alt="After"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 170px"
                  />
                  <span className="font-ui bg-gold absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[10px] text-white">
                    After
                  </span>
                </div>
              </div>
              {item.description && (
                <div className="p-3">
                  <p className="font-ui text-charcoal-light text-sm">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
