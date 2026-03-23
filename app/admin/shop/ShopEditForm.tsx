'use client';

import { useActionState, useState, useRef } from 'react';
import { updateShopInfo } from '@/lib/actions/shop';

interface ShopData {
  name: string;
  address: string;
  phone: string;
  parking_info: string | null;
  kakao_url: string | null;
  instagram_url: string | null;
  hours: Record<string, string>;
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일'] as const;

const TIME_OPTIONS = [
  '휴무',
  '06:00',
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
];

type DayHours = { open: string; close: string; closed: boolean };

function parseHours(hours: Record<string, string>): Record<string, DayHours> {
  const result: Record<string, DayHours> = {};
  for (const day of DAYS) {
    result[day] = { open: '10:00', close: '20:00', closed: false };
  }

  for (const [key, value] of Object.entries(hours)) {
    const isClosed = value === '휴무';
    const parts = isClosed ? ['10:00', '20:00'] : value.split(' - ').map((s) => s.trim());
    const open = parts[0] ?? '10:00';
    const close = parts[1] ?? '20:00';

    // "월-금", "토", "월-일" 같은 패턴 처리
    if (key.includes('-')) {
      const rangeParts = key.split('-');
      const startIdx = DAYS.indexOf(rangeParts[0] as (typeof DAYS)[number]);
      const endIdx = DAYS.indexOf(rangeParts[1] as (typeof DAYS)[number]);
      if (startIdx >= 0 && endIdx >= 0) {
        for (let i = startIdx; i <= endIdx; i++) {
          const d = DAYS[i];
          if (d) result[d] = { open, close, closed: isClosed };
        }
      }
    } else {
      if (DAYS.includes(key as (typeof DAYS)[number])) {
        result[key] = { open, close, closed: isClosed };
      }
    }
  }

  return result;
}

function buildHoursJson(dayHours: Record<string, DayHours>): Record<string, string> {
  // 같은 시간대를 묶어서 "월-금": "10:00 - 20:00" 형태로 만들기
  const groups: Array<{ days: string[]; value: string }> = [];

  for (const day of DAYS) {
    const h = dayHours[day];
    if (!h) continue;
    const value = h.closed ? '휴무' : `${h.open} - ${h.close}`;
    const last = groups[groups.length - 1];

    if (last && last.value === value) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], value });
    }
  }

  const result: Record<string, string> = {};
  for (const group of groups) {
    const first = group.days[0];
    const last = group.days[group.days.length - 1];
    if (!first) continue;
    const key = group.days.length === 1 ? first : `${first}-${last}`;
    result[key] = group.value;
  }

  return result;
}

export function ShopEditForm({ shop }: { shop: ShopData }) {
  const [state, action, isPending] = useActionState(updateShopInfo, null);
  const [dayHours, setDayHours] = useState(() => parseHours(shop.hours));
  const formRef = useRef<HTMLFormElement>(null);

  const updateDay = (day: string, field: keyof DayHours, value: string | boolean) => {
    setDayHours((prev) => {
      const current = prev[day] ?? { open: '10:00', close: '20:00', closed: false };
      return { ...prev, [day]: { ...current, [field]: value } };
    });
  };

  const hoursJson = JSON.stringify(buildHoursJson(dayHours));

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <Field label="매장명" name="name" defaultValue={shop.name} required />
      <Field label="주소" name="address" defaultValue={shop.address} />
      <Field label="전화번호" name="phone" defaultValue={shop.phone} />
      <Field label="위치 안내" name="parking_info" defaultValue={shop.parking_info ?? ''} />
      <Field
        label="네이버 URL"
        name="kakao_url"
        defaultValue={shop.kakao_url ?? ''}
        placeholder="https://map.naver.com/..."
      />
      <Field
        label="인스타그램 URL"
        name="instagram_url"
        defaultValue={shop.instagram_url ?? ''}
        placeholder="https://instagram.com/..."
      />

      {/* 운영시간 셀렉트 */}
      <div>
        <p className="font-ui text-charcoal mb-2 block text-sm font-medium">운영시간</p>
        <div className="border-gray-light space-y-2 rounded-lg border p-3">
          {DAYS.map((day) => {
            const h = dayHours[day] ?? { open: '10:00', close: '20:00', closed: false };
            return (
              <div key={day} className="flex items-center gap-2">
                <span className="font-ui text-charcoal w-6 shrink-0 text-center text-sm font-medium">
                  {day}
                </span>
                <label className="font-ui text-gray flex shrink-0 items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) => updateDay(day, 'closed', e.target.checked)}
                    className="accent-gold"
                  />
                  휴무
                </label>
                {!h.closed && (
                  <>
                    <select
                      value={h.open}
                      onChange={(e) => updateDay(day, 'open', e.target.value)}
                      className="border-gray-light font-ui text-charcoal rounded border px-2 py-1 text-xs"
                    >
                      {TIME_OPTIONS.filter((t) => t !== '휴무').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span className="font-ui text-gray text-xs">~</span>
                    <select
                      value={h.close}
                      onChange={(e) => updateDay(day, 'close', e.target.value)}
                      className="border-gray-light font-ui text-charcoal rounded border px-2 py-1 text-xs"
                    >
                      {TIME_OPTIONS.filter((t) => t !== '휴무').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <input type="hidden" name="hours" value={hoursJson} />

      {state?.success && <p className="font-ui text-success text-sm">저장되었습니다.</p>}
      {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="font-ui bg-gold hover:bg-gold-dark h-10 rounded-lg px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-ui text-charcoal mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="font-ui text-charcoal border-gray-light focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
      />
    </div>
  );
}
