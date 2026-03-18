'use client';

import { Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Service, ServiceCategory } from '@/types/database.types';

interface ServiceSelectorProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
}

const categoryLabel: Record<ServiceCategory, string> = {
  속눈썹연장: '속눈썹 연장',
  눈썹문신: '눈썹 문신',
  기타: '기타',
};

export function ServiceSelector({ services, selectedId, onSelect }: ServiceSelectorProps) {
  const grouped = services.reduce<Record<ServiceCategory, Service[]>>(
    (acc, svc) => {
      acc[svc.category].push(svc);
      return acc;
    },
    { 속눈썹연장: [], 눈썹문신: [], 기타: [] },
  );

  return (
    <div className="space-y-6">
      {(Object.entries(grouped) as [ServiceCategory, Service[]][])
        .filter(([, items]) => items.length > 0)
        .map(([category, items]) => (
          <div key={category}>
            <h3 className="font-ui text-charcoal mb-3 text-sm font-semibold">
              {categoryLabel[category]}
            </h3>
            <div className="space-y-2">
              {items.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onSelect(service)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                    selectedId === service.id
                      ? 'border-gold bg-gold/5 shadow-soft'
                      : 'border-gray-light hover:border-gold-light bg-white',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      selectedId === service.id ? 'bg-gold/20' : 'bg-cream',
                    )}
                  >
                    <Scissors
                      size={18}
                      strokeWidth={1.5}
                      className={selectedId === service.id ? 'text-gold-dark' : 'text-gray'}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-ui text-charcoal text-sm font-medium">{service.name}</p>
                    {service.description && (
                      <p className="font-ui text-gray mt-0.5 text-xs">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-ui text-charcoal text-sm font-semibold">
                      {service.price.toLocaleString()}원
                    </p>
                    <p className="font-ui text-gray text-xs">{service.duration}분</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
