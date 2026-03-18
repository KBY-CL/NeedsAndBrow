'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AvailableSlot } from '@/lib/domain/reservation/types';

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  selectedTime: string | null;
  loading: boolean;
  onSelect: (slot: AvailableSlot) => void;
}

export function TimeSlotPicker({ slots, selectedTime, loading, onSelect }: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-gold h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock size={24} strokeWidth={1.5} className="text-gray mx-auto mb-2" />
        <p className="font-ui text-gray text-sm">선택한 날짜에 가능한 시간이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isFull = slot.remainingCapacity <= 0;
        const isSelected = selectedTime === slot.time;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={isFull}
            onClick={() => onSelect(slot)}
            className={cn(
              'font-ui relative rounded-lg border px-3 py-3 text-center text-sm transition-all',
              isFull && 'border-gray-light text-gray cursor-not-allowed opacity-40',
              !isFull &&
                !isSelected &&
                'border-gray-light hover:border-gold-light text-charcoal bg-white',
              isSelected && 'border-gold bg-gold/10 text-gold-dark font-semibold',
            )}
          >
            {slot.time}
            {isFull && <span className="font-ui text-error mt-0.5 block text-[10px]">마감</span>}
          </button>
        );
      })}
    </div>
  );
}
