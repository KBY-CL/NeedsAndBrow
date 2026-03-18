import type {
  Profile,
  Service,
  TimeSlot,
  BlockedDate,
  Reservation,
  Gallery,
  Review,
  Event,
} from '@/types/database.types';

export const mockProfile: Profile = {
  id: 'user-1',
  name: '테스트 사용자',
  phone: '01012345678',
  role: 'user',
  avatar_url: null,
  is_active: true,
  deactivated_at: null,
  created_at: '2026-03-01T00:00:00Z',
};

export const mockAdmin: Profile = {
  ...mockProfile,
  id: 'admin-1',
  name: '관리자',
  role: 'admin',
};

export const mockService: Service = {
  id: 'service-1',
  name: '내추럴 속눈썹 연장',
  category: '속눈썹연장',
  description: '자연스러운 속눈썹 연장',
  duration: 90,
  price: 70000,
  is_active: true,
  sort_order: 0,
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

export const mockServices: Service[] = [
  mockService,
  {
    id: 'service-2',
    name: '볼륨 속눈썹 연장',
    category: '속눈썹연장',
    description: '풍성한 볼륨감',
    duration: 120,
    price: 90000,
    is_active: true,
    sort_order: 1,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'service-3',
    name: '콤보 눈썹 문신',
    category: '눈썹문신',
    description: null,
    duration: 60,
    price: 150000,
    is_active: true,
    sort_order: 2,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
];

export const mockTimeSlot: TimeSlot = {
  id: 'slot-1',
  time: '10:00',
  is_active: true,
  max_reservations: 1,
  sort_order: 0,
};

export const mockTimeSlots: TimeSlot[] = [
  mockTimeSlot,
  { id: 'slot-2', time: '11:00', is_active: true, max_reservations: 1, sort_order: 1 },
  { id: 'slot-3', time: '14:00', is_active: true, max_reservations: 2, sort_order: 2 },
  { id: 'slot-4', time: '15:00', is_active: false, max_reservations: 1, sort_order: 3 },
];

export const mockBlockedDate: BlockedDate = {
  id: 'blocked-1',
  date: '2026-03-25',
  reason: '매장 휴무',
  created_at: '2026-03-01T00:00:00Z',
};

export const mockReservation: Reservation = {
  id: 'res-1',
  user_id: 'user-1',
  service_id: 'service-1',
  date: '2026-03-20',
  time_slot: '14:00',
  status: 'pending',
  user_note: '처음 방문합니다',
  admin_note: null,
  cancelled_at: null,
  created_at: '2026-03-18T00:00:00Z',
  updated_at: '2026-03-18T00:00:00Z',
};

export const mockGalleryItem: Gallery = {
  id: 'gallery-1',
  category: '속눈썹연장',
  before_url: 'https://example.com/before.jpg',
  after_url: 'https://example.com/after.jpg',
  description: '내추럴 연장 시술',
  is_visible: true,
  sort_order: 0,
  created_at: '2026-03-01T00:00:00Z',
};

export const mockReview: Review = {
  id: 'review-1',
  user_id: 'user-1',
  title: '정말 좋았어요',
  content: '시술이 매우 만족스러웠습니다. 다음에도 방문하고 싶어요.',
  images: ['https://example.com/review1.jpg'],
  is_official: false,
  created_at: '2026-03-10T00:00:00Z',
  updated_at: '2026-03-10T00:00:00Z',
};

export const mockEvent: Event = {
  id: 'event-1',
  title: '봄맞이 할인 이벤트',
  content: '속눈썹 연장 20% 할인',
  image_url: null,
  start_date: '2026-03-01',
  end_date: '2026-03-31',
  is_active: true,
  created_at: '2026-02-28T00:00:00Z',
  updated_at: '2026-02-28T00:00:00Z',
};
