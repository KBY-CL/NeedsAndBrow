'use client';

import { useActionState, useState } from 'react';
import { Plus, Power, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createEvent, toggleEventActive, deleteEvent } from '@/lib/actions/event';
import type { Event } from '@/types/database.types';

type EventWithStatus = Event & { status: string };

const statusStyle: Record<string, string> = {
  예정: 'bg-info/20 text-info',
  진행중: 'bg-success/20 text-success',
  종료: 'bg-gray-light text-gray',
};

export function AdminEventList({ initialEvents }: { initialEvents: EventWithStatus[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(createEvent, null);

  const handleToggle = async (id: string, current: boolean) => {
    await toggleEventActive(id, !current);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 이벤트를 삭제하시겠습니까?')) return;
    await deleteEvent(id);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="font-ui bg-charcoal mb-6 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-white hover:bg-black"
      >
        <Plus size={16} />
        이벤트 추가
      </button>

      {showForm && (
        <form
          action={formAction}
          className="border-gray-light shadow-soft mb-6 space-y-4 rounded-xl border bg-white p-5"
        >
          <div>
            <label htmlFor="title" className="font-ui text-charcoal mb-1 block text-sm font-medium">
              제목
            </label>
            <input
              id="title"
              name="title"
              required
              className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="font-ui text-charcoal mb-1 block text-sm font-medium"
            >
              내용
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={4}
              className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                시작일
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="font-ui text-charcoal mb-1 block text-sm font-medium"
              >
                종료일
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                required
                className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="imageUrl"
              className="font-ui text-charcoal mb-1 block text-sm font-medium"
            >
              이미지 URL (선택)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              className="border-gray-light font-ui focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
            />
          </div>

          {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="font-ui bg-gold hover:bg-gold-dark h-9 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? '등록 중...' : '등록'}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {initialEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              'border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white p-4',
              !event.is_active && 'opacity-50',
            )}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-ui text-charcoal text-sm font-semibold">{event.title}</span>
                <span
                  className={cn(
                    'font-ui rounded-full px-2 py-0.5 text-xs font-medium',
                    statusStyle[event.status] ?? statusStyle['종료'],
                  )}
                >
                  {event.status}
                </span>
              </div>
              <p className="font-ui text-gray mt-1 text-xs">
                {event.start_date} ~ {event.end_date}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleToggle(event.id, event.is_active)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                  event.is_active ? 'bg-success/10 text-success' : 'bg-gray-light text-gray',
                )}
                title={event.is_active ? '비활성화' : '활성화'}
              >
                <Power size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(event.id)}
                className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg"
                title="삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {initialEvents.length === 0 && (
          <p className="font-ui text-gray py-8 text-center text-sm">등록된 이벤트가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
