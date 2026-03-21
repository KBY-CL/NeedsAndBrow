'use client';

import { useActionState, useState, useTransition } from 'react';
import { Plus, Power, Pencil, Trash2, X, EyeOff, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createService,
  updateService,
  toggleServiceActive,
  toggleServiceHidden,
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
            가격 (원, 0=가격 문의)
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

function ServiceRow({
  service,
  onEdit,
  editingId,
  updateAction,
  isUpdatePending,
  updateError,
  onCancelEdit,
}: {
  service: Service;
  onEdit: (id: string) => void;
  editingId: string | null;
  updateAction: (payload: FormData) => void;
  isUpdatePending: boolean;
  updateError?: string;
  onCancelEdit: () => void;
}) {
  const [deleteError, setDeleteError] = useState('');
  const [isPendingToggle, startToggleTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const handleToggleActive = () => {
    startToggleTransition(async () => {
      await toggleServiceActive(service.id, !service.is_active);
    });
  };

  const handleToggleHidden = () => {
    startToggleTransition(async () => {
      await toggleServiceHidden(service.id, !service.is_hidden);
    });
  };

  const handleDelete = () => {
    if (!confirm('이 서비스를 삭제하시겠습니까?')) return;
    startDeleteTransition(async () => {
      const result = await deleteService(service.id);
      if (!result.success && result.error) setDeleteError(result.error);
    });
  };

  if (editingId === service.id) {
    return (
      <div className="border-gold shadow-soft rounded-xl border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-ui text-charcoal text-sm font-semibold">서비스 수정</span>
          <button type="button" onClick={onCancelEdit} className="text-gray hover:text-charcoal">
            <X size={16} />
          </button>
        </div>
        <ServiceForm
          defaultValues={service}
          action={updateAction}
          isPending={isUpdatePending}
          error={updateError}
          onCancel={onCancelEdit}
          submitLabel="저장"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border-gray-light shadow-soft rounded-xl border bg-white p-4',
        !service.is_active && 'opacity-50',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-ui text-charcoal text-sm font-semibold">{service.name}</span>
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
            onClick={() => onEdit(service.id)}
            className="text-gray hover:text-gold-dark flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-amber-50"
            title="수정"
          >
            <Pencil size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isPendingToggle}
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
            onClick={handleToggleHidden}
            disabled={isPendingToggle}
            className="text-gray bg-gray-light hover:bg-gray-light/80 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            title="숨기기"
          >
            <EyeOff size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPendingDelete}
            className="bg-error/10 text-error hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
            title="삭제"
          >
            <Trash2 size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {deleteError && <p className="font-ui text-error mt-2 text-xs">{deleteError}</p>}
    </div>
  );
}

export function AdminServiceList({ initialServices }: AdminServiceListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const [createState, createAction, isCreatePending] = useActionState(createService, null);
  const [updateState, updateAction, isUpdatePending] = useActionState(
    editingId ? updateService.bind(null, editingId) : updateService.bind(null, ''),
    null,
  );

  const visible = initialServices.filter((s) => !s.is_hidden);
  const hidden = initialServices.filter((s) => s.is_hidden);

  const rowProps = {
    editingId,
    updateAction,
    isUpdatePending,
    updateError: updateState && !updateState.success ? updateState.error : undefined,
    onCancelEdit: () => setEditingId(null),
    onEdit: (id: string) => {
      setEditingId(id);
      setShowForm(false);
    },
  };

  return (
    <div className="space-y-6">
      {/* Add button */}
      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
        }}
        className="font-ui bg-charcoal inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-black"
      >
        <Plus size={16} strokeWidth={1.5} />
        서비스 추가
      </button>

      {/* Create form */}
      {showForm && (
        <div className="border-gray-light shadow-soft rounded-xl border bg-white p-5">
          <ServiceForm
            action={createAction}
            isPending={isCreatePending}
            error={createState && !createState.success ? createState.error : undefined}
            onCancel={() => setShowForm(false)}
            submitLabel="등록"
          />
        </div>
      )}

      {/* 카테고리별 서비스 목록 */}
      {categories.map((category) => {
        const items = visible.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <h2 className="font-ui text-charcoal text-lg font-semibold">{category}</h2>
            {items.map((service) => (
              <ServiceRow key={service.id} service={service} {...rowProps} />
            ))}
          </div>
        );
      })}
      {visible.length === 0 && (
        <p className="font-ui text-gray py-6 text-center text-sm">등록된 서비스가 없습니다.</p>
      )}

      {/* 숨긴 서비스 목록 */}
      {hidden.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowHidden((v) => !v)}
            className="font-ui text-gray hover:text-charcoal flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
          >
            {showHidden ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            숨긴 서비스 ({hidden.length})
          </button>

          {showHidden && (
            <div className="space-y-2">
              {hidden.map((service) => (
                <div
                  key={service.id}
                  className="border-gray-light rounded-xl border bg-white p-4 opacity-40"
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
                    </div>
                    <div className="ml-3 flex shrink-0 gap-1">
                      <HiddenServiceActions service={service} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HiddenServiceActions({ service }: { service: Service }) {
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      await toggleServiceHidden(service.id, false);
    });
  };

  const handleDelete = () => {
    if (!confirm('이 서비스를 삭제하시겠습니까?')) return;
    startTransition(async () => {
      const result = await deleteService(service.id);
      if (!result.success && result.error) setDeleteError(result.error);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleRestore}
        disabled={isPending}
        className="text-gray hover:text-charcoal flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-50"
        title="복원"
      >
        <Eye size={15} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="bg-error/10 text-error hover:bg-error/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50"
        title="삭제"
      >
        <Trash2 size={15} strokeWidth={1.5} />
      </button>
      {deleteError && <p className="font-ui text-error mt-1 text-xs">{deleteError}</p>}
    </>
  );
}
