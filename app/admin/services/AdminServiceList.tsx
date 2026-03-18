'use client';

import { useActionState, useState } from 'react';
import { Plus, Power } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createService, toggleServiceActive } from '@/lib/actions/admin-service';
import type { Service, ServiceCategory } from '@/types/database.types';

interface AdminServiceListProps {
  initialServices: Service[];
}

const categories: ServiceCategory[] = ['속눈썹연장', '눈썹문신', '기타'];

export function AdminServiceList({ initialServices }: AdminServiceListProps) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createService, null);

  const handleToggle = async (id: string, current: boolean) => {
    await toggleServiceActive(id, !current);
  };

  return (
    <div>
      {/* Add button */}
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="font-ui bg-charcoal mb-6 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-black"
      >
        <Plus size={16} strokeWidth={1.5} />
        서비스 추가
      </button>

      {/* Create form */}
      {showForm && (
        <form
          action={formAction}
          className="border-gray-light shadow-soft mb-6 space-y-4 rounded-xl border bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                서비스명
              </label>
              <input
                id="name"
                name="name"
                required
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                카테고리
              </label>
              <select
                id="category"
                name="category"
                required
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="price"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                가격 (원)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                required
                min={0}
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                소요시간 (분)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                required
                min={10}
                defaultValue={60}
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="description"
              className="font-ui text-charcoal mb-1 block text-sm font-medium"
            >
              설명 (선택)
            </label>
            <input
              id="description"
              name="description"
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
            />
          </div>
          <input type="hidden" name="sortOrder" value="0" />

          {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="font-ui bg-gold hover:bg-gold-dark h-9 rounded-lg px-5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            {isPending ? '등록 중...' : '등록'}
          </button>
        </form>
      )}

      {/* Service list */}
      <div className="space-y-2">
        {initialServices.map((service) => (
          <div
            key={service.id}
            className={cn(
              'border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4',
              !service.is_active && 'opacity-50',
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-ui text-charcoal text-sm font-semibold">{service.name}</span>
                <span className="font-ui bg-cream text-charcoal-light rounded-full px-2 py-0.5 text-xs">
                  {service.category}
                </span>
              </div>
              <p className="font-ui text-gray mt-1 text-xs">
                {service.price.toLocaleString()}원 &middot; {service.duration}분
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(service.id, service.is_active)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                service.is_active
                  ? 'text-success bg-success/10 hover:bg-success/20'
                  : 'text-gray bg-gray-light hover:bg-gray-light/80',
              )}
              title={service.is_active ? '비활성화' : '활성화'}
            >
              <Power size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
