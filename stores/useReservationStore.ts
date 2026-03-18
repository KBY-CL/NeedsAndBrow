'use client';

import { create } from 'zustand';
import type { Service } from '@/types/database.types';
import type { AvailableSlot } from '@/lib/domain/reservation/types';

interface ReservationState {
  // 선택 상태
  selectedService: Service | null;
  selectedDate: string | null;
  selectedSlot: AvailableSlot | null;
  userNote: string;

  // 가용 슬롯 데이터
  availableSlots: AvailableSlot[];
  slotsLoading: boolean;

  // 액션
  setService: (service: Service | null) => void;
  setDate: (date: string | null) => void;
  setSlot: (slot: AvailableSlot | null) => void;
  setUserNote: (note: string) => void;
  setAvailableSlots: (slots: AvailableSlot[]) => void;
  setSlotsLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  userNote: '',
  availableSlots: [],
  slotsLoading: false,
};

export const useReservationStore = create<ReservationState>((set) => ({
  ...initialState,

  setService: (service) => set({ selectedService: service }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setUserNote: (note) => set({ userNote: note }),
  setAvailableSlots: (slots) => set({ availableSlots: slots }),
  setSlotsLoading: (loading) => set({ slotsLoading: loading }),
  reset: () => set(initialState),
}));
