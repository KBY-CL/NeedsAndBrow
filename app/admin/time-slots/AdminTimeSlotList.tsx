'use client';

import { useActionState, useState } from 'react';
import { Plus, Trash2, Power, CalendarOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createTimeSlot,
  toggleTimeSlotActive,
  deleteTimeSlot,
  addBlockedDate,
  removeBlockedDate,
} from '@/lib/actions/admin-timeslot';
import type { TimeSlot, BlockedDate } from '@/types/database.types';

interface Props {
  initialSlots: TimeSlot[];
  initialBlockedDates: BlockedDate[];
}

export function AdminTimeSlotList({ initialSlots, initialBlockedDates }: Props) {
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);
  const [slotState, slotFormAction, slotPending] = useActionState(createTimeSlot, null);

  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  const handleToggleSlot = async (id: string, current: boolean) => {
    await toggleTimeSlotActive(id, !current);
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('이 시간 슬롯을 삭제하시겠습니까?')) return;
    await deleteTimeSlot(id);
  };

  const handleAddBlockedDate = async () => {
    if (!newDate) return;
    await addBlockedDate(newDate, newReason || undefined);
    setNewDate('');
    setNewReason('');
  };

  const handleRemoveBlockedDate = async (id: string) => {
    await removeBlockedDate(id);
  };

  return (
    <div className="space-y-10">
      {/* Time Slots Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ui text-charcoal text-lg font-semibold">시간 슬롯</h2>
          <button
            type="button"
            onClick={() => setShowSlotForm(!showSlotForm)}
            className="font-ui bg-charcoal inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-white hover:bg-black"
          >
            <Plus size={14} />
            추가
          </button>
        </div>

        {showSlotForm && (
          <form
            action={slotFormAction}
            className="border-gray-light shadow-soft mb-4 grid grid-cols-2 gap-3 rounded-xl border bg-white p-4 sm:flex sm:flex-wrap sm:items-end"
          >
            <div>
              <label
                htmlFor="time"
                className="font-ui text-charcoal mb-1 block text-xs font-medium"
              >
                시간 (HH:MM)
              </label>
              <input
                id="time"
                name="time"
                placeholder="10:00"
                required
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 sm:w-24"
              />
            </div>
            <div>
              <label
                htmlFor="maxReservations"
                className="font-ui text-charcoal mb-1 block text-xs font-medium"
              >
                최대 예약
              </label>
              <input
                id="maxReservations"
                name="maxReservations"
                type="number"
                min={1}
                defaultValue={1}
                required
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 sm:w-20"
              />
            </div>
            <input type="hidden" name="sortOrder" value="0" />
            {slotState && !slotState.success && (
              <p className="font-ui text-error col-span-2 w-full text-xs">{slotState.error}</p>
            )}
            <button
              type="submit"
              disabled={slotPending}
              className="font-ui bg-gold hover:bg-gold-dark col-span-2 h-9 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-50 sm:col-span-1"
            >
              등록
            </button>
          </form>
        )}

        <div className="space-y-2">
          {initialSlots.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                'border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white px-4 py-3',
                !slot.is_active && 'opacity-50',
              )}
            >
              <div>
                <span className="font-ui text-charcoal text-sm font-semibold">{slot.time}</span>
                <span className="font-ui text-gray ml-2 text-xs">
                  최대 {slot.max_reservations}건
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleSlot(slot.id, slot.is_active)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
                    slot.is_active ? 'text-success bg-success/10' : 'text-gray bg-gray-light',
                  )}
                  title={slot.is_active ? '비활성화' : '활성화'}
                >
                  <Power size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {initialSlots.length === 0 && (
            <p className="font-ui text-gray py-8 text-center text-sm">
              등록된 시간 슬롯이 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* Blocked Dates Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-ui text-charcoal text-lg font-semibold">예약 마감일</h2>
          <button
            type="button"
            onClick={() => setShowDateForm(!showDateForm)}
            className="font-ui bg-charcoal inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs font-medium text-white hover:bg-black"
          >
            <CalendarOff size={14} />
            추가
          </button>
        </div>

        {showDateForm && (
          <div className="border-gray-light shadow-soft mb-4 grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 sm:flex sm:flex-wrap sm:items-end">
            <div>
              <label
                htmlFor="blockedDate"
                className="font-ui text-charcoal mb-1 block text-xs font-medium"
              >
                날짜
              </label>
              <input
                id="blockedDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
            <div>
              <label
                htmlFor="reason"
                className="font-ui text-charcoal mb-1 block text-xs font-medium"
              >
                사유 (선택)
              </label>
              <input
                id="reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="예: 매장 휴무"
                className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-1"
              />
            </div>
            <button
              type="button"
              onClick={handleAddBlockedDate}
              className="font-ui bg-gold hover:bg-gold-dark h-9 w-full rounded-lg px-4 text-sm font-medium text-white sm:w-auto"
            >
              등록
            </button>
          </div>
        )}

        <div className="space-y-2">
          {initialBlockedDates.map((bd) => (
            <div
              key={bd.id}
              className="border-gray-light shadow-soft flex items-center justify-between rounded-xl border bg-white px-4 py-3"
            >
              <div>
                <span className="font-ui text-charcoal text-sm font-semibold">{bd.date}</span>
                {bd.reason && <span className="font-ui text-gray ml-2 text-xs">{bd.reason}</span>}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveBlockedDate(bd.id)}
                className="bg-error/10 text-error hover:bg-error/20 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                title="해제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {initialBlockedDates.length === 0 && (
            <p className="font-ui text-gray py-8 text-center text-sm">등록된 마감일이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}
