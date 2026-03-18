'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReservationCalendarProps {
  selectedDate: string | null;
  blockedDates?: string[];
  onSelect: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function ReservationCalendar({
  selectedDate,
  blockedDates = [],
  onSelect,
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = useMemo(() => startOfDay(new Date()), []);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  return (
    <div className="border-gray-light rounded-xl border bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="text-charcoal-light hover:text-charcoal flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </button>
        <h3 className="font-ui text-charcoal text-sm font-semibold">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-charcoal-light hover:text-charcoal flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, i) => (
          <span
            key={day}
            className={cn(
              'font-ui text-xs font-medium',
              i === 0 ? 'text-error' : i === 6 ? 'text-info' : 'text-gray',
            )}
          >
            {day}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isPast = isBefore(day, today);
          const isBlocked = blockedSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = isSameDay(day, today);
          const disabled = !isCurrentMonth || isPast || isBlocked;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(dateStr)}
              className={cn(
                'font-ui relative flex h-10 w-full items-center justify-center rounded-lg text-sm transition-all',
                disabled && 'cursor-not-allowed opacity-30',
                !disabled && !isSelected && 'hover:bg-cream',
                isSelected && 'bg-gold font-semibold text-white',
                !isSelected && isToday && 'text-gold-dark font-semibold',
                !isSelected && !isToday && isCurrentMonth && 'text-charcoal',
              )}
            >
              {format(day, 'd')}
              {isBlocked && isCurrentMonth && !isPast && (
                <span className="bg-error absolute bottom-1 h-1 w-1 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="bg-error inline-block h-2 w-2 rounded-full" />
          <span className="font-ui text-gray text-xs">마감</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="bg-gold inline-block h-2 w-2 rounded-full" />
          <span className="font-ui text-gray text-xs">선택됨</span>
        </div>
      </div>
    </div>
  );
}
