'use client';

import { useActionState, useState, useRef } from 'react';
import { Plus, Eye, EyeOff, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createGalleryItem,
  toggleGalleryVisibility,
  deleteGalleryItem,
} from '@/lib/actions/gallery';
import type { Gallery, ServiceCategory } from '@/types/database.types';

const categories: ServiceCategory[] = ['속눈썹연장', '눈썹문신', '기타'];

export function AdminGalleryList({ initialItems }: { initialItems: Gallery[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createGalleryItem, null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleToggle = async (id: string, current: boolean) => {
    await toggleGalleryVisibility(id, !current);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;
    await deleteGalleryItem(id);
  };

  const handleFilePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(URL.createObjectURL(file));
    } else {
      setter(null);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setShowForm(!showForm);
          setBeforePreview(null);
          setAfterPreview(null);
        }}
        className="font-ui bg-charcoal mb-6 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white hover:bg-black"
      >
        <Plus size={16} />
        사진 추가
      </button>

      {showForm && (
        <form
          ref={formRef}
          action={formAction}
          className="border-gray-light shadow-soft mb-6 space-y-4 rounded-xl border bg-white p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
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
                htmlFor="description"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                설명 (선택)
              </label>
              <input
                id="description"
                name="description"
                className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
          </div>

          {/* 파일 업로드 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="font-ui text-charcoal mb-1 block text-sm font-medium">
                Before 사진
              </label>
              <label className="border-gray-light hover:border-gold flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                {beforePreview ? (
                  <img
                    src={beforePreview}
                    alt="Before preview"
                    className="mb-2 h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <Upload size={24} className="text-gray mb-2" />
                )}
                <span className="font-ui text-gray text-xs">
                  {beforePreview ? '다른 사진 선택' : '사진 선택'}
                </span>
                <input
                  type="file"
                  name="beforeFile"
                  accept="image/*"
                  required
                  className="hidden"
                  onChange={(e) => handleFilePreview(e, setBeforePreview)}
                />
              </label>
            </div>
            <div>
              <label className="font-ui text-charcoal mb-1 block text-sm font-medium">
                After 사진
              </label>
              <label className="border-gray-light hover:border-gold flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors">
                {afterPreview ? (
                  <img
                    src={afterPreview}
                    alt="After preview"
                    className="mb-2 h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <Upload size={24} className="text-gray mb-2" />
                )}
                <span className="font-ui text-gray text-xs">
                  {afterPreview ? '다른 사진 선택' : '사진 선택'}
                </span>
                <input
                  type="file"
                  name="afterFile"
                  accept="image/*"
                  required
                  className="hidden"
                  onChange={(e) => handleFilePreview(e, setAfterPreview)}
                />
              </label>
            </div>
          </div>

          {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="font-ui bg-gold hover:bg-gold-dark h-9 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? '업로드 중...' : '등록'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {initialItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4',
              !item.is_visible && 'opacity-50',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="bg-cream flex gap-1 overflow-hidden rounded-lg">
                <img src={item.before_url} alt="Before" className="h-12 w-12 object-cover" />
                <img src={item.after_url} alt="After" className="h-12 w-12 object-cover" />
              </div>
              <div>
                <span className="font-ui text-charcoal text-sm font-semibold">{item.category}</span>
                {item.description && (
                  <p className="font-ui text-gray text-xs">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleToggle(item.id, item.is_visible)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                  item.is_visible ? 'bg-success/10 text-success' : 'bg-gray-light text-gray',
                )}
                title={item.is_visible ? '숨기기' : '공개'}
              >
                {item.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg"
                title="삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {initialItems.length === 0 && (
          <p className="font-ui text-gray py-8 text-center text-sm">등록된 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
