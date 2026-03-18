import type { Reservation, Service, TimeSlot } from '@/types/database.types';

export type RuleResult = { ok: true } | { ok: false; reason: string };

export interface CreateReservationInput {
  date: string;
  timeSlot: string;
  serviceId: string;
  userNote?: string;
}

export interface ReservationWithDetails extends Reservation {
  service: Pick<Service, 'name' | 'category' | 'duration' | 'price'>;
}

export interface AvailableSlot extends TimeSlot {
  remainingCapacity: number;
}
