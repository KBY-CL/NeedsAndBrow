'use client';

import { useActionState, useState, useTransition } from 'react';
import { Plus, Power, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createService,
  updateService,
  toggleServiceActive,
  deleteService,
} from '@/lib/actions/admin-service';
import type { Service, ServiceCategory } from '@/types/database.types';

interface AdminServiceListProps {
  initialServices: Service[];
}

const categories: ServiceCategory[] = [
  '이벤트',
  '속눈썹연장',
  '속눈썹펌',
  '왁싱',
  '눈썹문신',
  '기타',
];

function ServiceForm({
  defaultValues,
  action,
  isPending,
  error,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<Service>;
  action: (payload: FormData) => void;
  isPending: boolean;
  error?: string;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-ui text-charcoal mb-1 block text-sm font-medium">
            서비스명
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name}
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
            defaultValue={defaultValues?.category ?? '속눈썹연장'}
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
          <label htmlFor="price" className="font-ui text-charcoal mb-1 block text-sm font-medium">
            가격 (원)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={0}
            defaultValue={defaultValues?.price ?? 0}
            className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            className="font-ui text-charcoal mb-1 block text-sm font-medium"
          >
            소요시간 (분, 0=표시 안함)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            required
            min={0}
            defaultValue={defaultValues?.duration ?? 60}
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
          defaultValue={defaultValues?.description ?? ''}
          className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
        />
      </div>
      <input type="hidden" name="sortOrder" value={defaultValues?.sort_order ?? 0} />

      {error && <p className="font-ui text-error text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="font-ui bg-gold hover:bg-gold-dark h-9 rounded-lg px-5 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '저장 중...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-ui text-gray h-9 rounded-lg px-4 text-sm hover:underline"
        >
          취소
        </button>
      </div>
    </form>
  );
}

export function AdminServiceList({ initialServices }: AdminServiceListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const [createState, createAction, isCreatePending] = useActionState(createService, null);
  const [updateState, updateAction, isUpdatePending] = useActionState(
    editingId ? updateService.bind(null, editingId) : updateService.bind(null, ''),
    null,
  );

  const handleToggle = async (id: string, current: boolean) => {
    await toggleServiceActive(id, !current);
  };

  const handleDelete = (id: string) => {
    if (!confirm('이 서비스를 삭제하시겠습니까?')) return;
    startDeleteTransition(async () => {
      const result = await deleteService(id);
      if (!result.success && result.error) {
        setDeleteError((prev) => ({ ...prev, [id]: result.error! }));
      }
    });
  };

  const handleEditStart = (id: string) => {
    setEditingId(id);
    setShowForm(false);
  };

  return (
    <div>
      {/* Add button */}
      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
        }}
        className="font-ui bg-charcoal mb-6 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-black"
      >
        <Plus size={16} strokeWidth={1.5} />
        서비스 추가
      </button>

      {/* Create form */}
      {showForm && (
        <div className="border-gray-light shadow-soft mb-6 rounded-xl border bg-white p-5">
          <ServiceForm
            action={createAction}
            isPending={isCreatePending}
            error={createState && !createState.success ? createState.error : undefined}
            onCancel={() => setShowForm(false)}
            submitLabel="등록"
          />
        </div>
      )}

      {/* Service list */}
      <div className="space-y-2">
        {initialServices.map((service) => (
          <div key={service.id}>
            {editingId === service.id ? (
              /* Edit form */
              <div className="border-gold shadow-soft rounded-xl border bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-ui text-charcoal text-sm font-semibold">서비스 수정</span>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-gray hover:text-charcoal"
                  >
                    <X size={16} />
                  </button>
                </div>
                <ServiceForm
                  defaultValues={service}
                  action={updateAction}
                  isPending={isUpdatePending}
                  error={updateState && !updateState.success ? updateState.error : undefined}
                  onCancel={() => setEditingId(null)}
                  submitLabel="저장"
                />
              </div>
            ) : (
              /* Service row */
              <div
                className={cn(
                  'border-gray-light shadow-soft rounded-xl border bg-white p-4',
                  !service.is_active && 'opacity-50',
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-ui text-charcoal text-sm font-semibold">
                        {service.name}
                      </span>
                      <span className="font-ui bg-cream text-charcoal-light rounded-full px-2 py-0.5 text-xs">
                        {service.category}
                      </span>
                    </div>
                    <p className="font-ui text-gray mt-1 text-xs">
                      {service.price === 0 ? '가격 문의' : `${service.price.toLocaleString()}원`}
                      {service.duration > 0 && ` · ${service.duration}분`}
                    </p>
                    {service.description && (
                      <p className="font-ui text-gray mt-0.5 text-xs">{service.description}</p>
                    )}
                  </div>
                  <div className="ml-3 flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditStart(service.id)}
                      className="text-gray hover:text-gold-dark flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-amber-50"
                      title="수정"
                    >
                      <Pencil size={15} strokeWidth={1.5} />
                    </button>
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
                      <Power size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id)}
                      disabled={isPendingDelete}
                      className="bg-error/10 text-error hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
                      title="삭제"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                {deleteError[service.id] && (
                  <p className="font-ui text-error mt-2 text-xs">{deleteError[service.id]}</p>
                )}
              </div>
            )}
          </div>
        ))}
        {initialServices.length === 0 && (
          <p className="font-ui text-gray py-8 text-center text-sm">등록된 서비스가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
