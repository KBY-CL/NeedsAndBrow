'use client';

import { useActionState, useEffect, useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CheckCircle, Phone } from 'lucide-react';
import { useReservationStore } from '@/stores/useReservationStore';
import { createReservation, getAvailableSlots } from '@/lib/actions/reservation';
import { savePhone } from '@/lib/actions/profile';
import { ServiceSelector } from './ServiceSelector';
import { ReservationCalendar } from './ReservationCalendar';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { Service } from '@/types/database.types';

interface ReservationFormProps {
  services: Service[];
  blockedDates: string[];
  initialPhone: string | null;
}

type Step = 'service' | 'date' | 'time' | 'confirm';

export function ReservationForm({ services, blockedDates, initialPhone }: ReservationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('service');
  const [state, formAction, isPending] = useActionState(createReservation, null);
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSavingPhone, startSavePhone] = useTransition();
  const hasPhone = !!phone;

  const {
    selectedService,
    selectedDate,
    selectedSlot,
    userNote,
    availableSlots,
    slotsLoading,
    setService,
    setDate,
    setSlot,
    setUserNote,
    setAvailableSlots,
    setSlotsLoading,
    reset,
  } = useReservationStore();

  // 날짜 선택 시 슬롯 로드
  const loadSlots = useCallback(
    async (date: string) => {
      setSlotsLoading(true);
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
      setSlotsLoading(false);
    },
    [setAvailableSlots, setSlotsLoading],
  );

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, loadSlots]);

  // 성공 시 리다이렉트
  useEffect(() => {
    if (state?.success) {
      reset();
    }
  }, [state?.success, reset]);

  const handleServiceSelect = (service: Service) => {
    setService(service);
    setStep('date');
  };

  const handleDateSelect = (date: string) => {
    setDate(date);
    setStep('time');
  };

  const handleSlotSelect = (slot: typeof selectedSlot) => {
    setSlot(slot);
    setStep('confirm');
  };

  // 성공 화면
  if (state?.success) {
    return (
      <div className="py-16 text-center">
        <CheckCircle size={48} strokeWidth={1.5} className="text-success mx-auto mb-4" />
        <h2 className="font-display text-charcoal text-2xl">예약 문의 완료</h2>
        <p className="font-ui text-gray mt-2 text-sm">예약 확인 후 안내드리겠습니다.</p>
        <button
          type="button"
          onClick={() => router.push('/mypage')}
          className="font-ui bg-charcoal mt-6 inline-flex h-11 items-center rounded-lg px-6 text-sm font-medium text-white transition-colors hover:bg-black"
        >
          내 예약 확인하기
        </button>
      </div>
    );
  }

  const handleSavePhone = () => {
    setPhoneError(null);
    startSavePhone(async () => {
      const result = await savePhone(phoneInput);
      if (result.success) {
        setPhone(phoneInput.replace(/-/g, ''));
        setPhoneInput('');
      } else {
        setPhoneError(result.error ?? '저장에 실패했습니다.');
      }
    });
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* 연락처 미등록 안내 */}
      {!hasPhone && (
        <div className="border-gold/40 bg-gold/5 mb-6 rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Phone size={16} className="text-gold-dark" />
            <p className="font-ui text-charcoal text-sm font-semibold">연락처 등록 필요</p>
          </div>
          <p className="font-ui text-gray mb-3 text-xs">
            예약 확인을 위해 연락처를 먼저 등록해 주세요.
          </p>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePhone()}
              placeholder="010-0000-0000"
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-1"
            />
            <button
              type="button"
              onClick={handleSavePhone}
              disabled={isSavingPhone || !phoneInput}
              className="font-ui bg-gold hover:bg-gold-dark shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isSavingPhone ? '저장 중...' : '저장'}
            </button>
          </div>
          {phoneError && <p className="font-ui text-error mt-2 text-xs">{phoneError}</p>}
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {(['service', 'date', 'time', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`font-ui flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? 'bg-gold text-white'
                  : i < (['service', 'date', 'time', 'confirm'] as Step[]).indexOf(step)
                    ? 'bg-gold/20 text-gold-dark'
                    : 'bg-gray-light text-gray'
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="bg-gray-light h-px w-6" />}
          </div>
        ))}
      </div>

      {/* Step: Service */}
      {step === 'service' && (
        <section>
          <h2 className="font-display text-charcoal mb-4 text-xl">시술 선택</h2>
          <ServiceSelector
            services={services}
            selectedId={selectedService?.id ?? null}
            onSelect={handleServiceSelect}
          />
        </section>
      )}

      {/* Step: Date */}
      {step === 'date' && (
        <section>
          <h2 className="font-display text-charcoal mb-4 text-xl">날짜 선택</h2>
          <ReservationCalendar
            selectedDate={selectedDate}
            blockedDates={blockedDates}
            onSelect={handleDateSelect}
          />
          <button
            type="button"
            onClick={() => setStep('service')}
            className="font-ui text-gray mt-4 text-sm hover:underline"
          >
            &larr; 시술 다시 선택
          </button>
        </section>
      )}

      {/* Step: Time */}
      {step === 'time' && (
        <section>
          <h2 className="font-display text-charcoal mb-4 text-xl">시간 선택</h2>
          <p className="font-ui text-gray mb-4 text-sm">{selectedDate} 가능한 시간</p>
          <TimeSlotPicker
            slots={availableSlots}
            selectedTime={selectedSlot?.time ?? null}
            loading={slotsLoading}
            onSelect={handleSlotSelect}
          />
          <button
            type="button"
            onClick={() => setStep('date')}
            className="font-ui text-gray mt-4 text-sm hover:underline"
          >
            &larr; 날짜 다시 선택
          </button>
        </section>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && selectedService && selectedDate && selectedSlot && (
        <section>
          <h2 className="font-display text-charcoal mb-4 text-xl">예약 확인</h2>

          {/* Summary card */}
          <div className="border-gray-light shadow-soft mb-6 rounded-xl border bg-white p-5">
            <div className="space-y-3">
              <SummaryRow label="시술" value={selectedService.name} />
              <SummaryRow label="가격" value={`${selectedService.price.toLocaleString()}원`} />
              <SummaryRow label="날짜" value={selectedDate} />
              <SummaryRow label="시간" value={selectedSlot.time} />
              <SummaryRow label="소요시간" value={`약 ${selectedService.duration}분`} />
            </div>
          </div>

          {/* Note input */}
          <div className="mb-6">
            <label
              htmlFor="userNote"
              className="font-ui text-charcoal mb-2 block text-sm font-medium"
            >
              요청 사항 (선택)
            </label>
            <textarea
              id="userNote"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="추가 요청 사항이 있으시면 입력해 주세요."
              className="border-gray-light font-ui text-charcoal focus:border-gold focus:ring-gold/30 placeholder:text-gray w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-1"
            />
          </div>

          {/* Error */}
          {state && !state.success && (
            <p className="font-ui text-error mb-4 text-sm">{state.error}</p>
          )}

          {/* Submit form (hidden inputs + submit button) */}
          <form action={formAction}>
            <input type="hidden" name="serviceId" value={selectedService.id} />
            <input type="hidden" name="date" value={selectedDate} />
            <input type="hidden" name="timeSlot" value={selectedSlot.time} />
            <input type="hidden" name="userNote" value={userNote} />

            <button
              type="submit"
              disabled={isPending}
              className="font-ui bg-gold hover:bg-gold-dark flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium tracking-wide text-white transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <CalendarDays size={16} strokeWidth={1.5} />
                  예약 문의하기
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setStep('time')}
            className="font-ui text-gray mt-4 w-full text-center text-sm hover:underline"
          >
            &larr; 시간 다시 선택
          </button>
        </section>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-ui text-gray text-sm">{label}</span>
      <span className="font-ui text-charcoal text-sm font-medium">{value}</span>
    </div>
  );
}
