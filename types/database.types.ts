// 자동 생성 타입 파일 — 스키마 기반 수동 작성
// 로컬 Supabase 실행 후 `pnpm db:types` 로 덮어쓸 것

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          role: 'user' | 'admin';
          avatar_url: string | null;
          is_active: boolean;
          deactivated_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          is_active?: boolean;
          deactivated_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          role?: 'user' | 'admin';
          avatar_url?: string | null;
          is_active?: boolean;
          deactivated_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      services: {
        Row: {
          id: string;
          name: string;
          category: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          description: string | null;
          duration: number;
          price: number;
          is_active: boolean;
          is_hidden: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          description?: string | null;
          duration?: number;
          price: number;
          is_active?: boolean;
          is_hidden?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          description?: string | null;
          duration?: number;
          price?: number;
          is_active?: boolean;
          is_hidden?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      time_slots: {
        Row: {
          id: string;
          time: string;
          is_active: boolean;
          max_reservations: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          time: string;
          is_active?: boolean;
          max_reservations?: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          time?: string;
          is_active?: boolean;
          max_reservations?: number;
          sort_order?: number;
        };
        Relationships: [];
      };

      blocked_dates: {
        Row: {
          id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      reservations: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          user_note: string | null;
          admin_note: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          date: string;
          time_slot: string;
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          user_note?: string | null;
          admin_note?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          date?: string;
          time_slot?: string;
          status?: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
          user_note?: string | null;
          admin_note?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reservations_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          },
        ];
      };

      gallery: {
        Row: {
          id: string;
          category: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          before_url: string;
          after_url: string;
          description: string | null;
          is_visible: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          before_url: string;
          after_url: string;
          description?: string | null;
          is_visible?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: '이벤트' | '속눈썹연장' | '속눈썹펌' | '왁싱' | '눈썹문신' | '기타';
          before_url?: string;
          after_url?: string;
          description?: string | null;
          is_visible?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      reviews: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          images: string[];
          is_official: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          images?: string[];
          is_official?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          images?: string[];
          is_official?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      events: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_url: string | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          image_url?: string | null;
          start_date: string;
          end_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      inquiries: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          content: string;
          password_hash: string | null;
          answer: string | null;
          answered_at: string | null;
          status: 'pending' | 'answered';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          content: string;
          password_hash?: string | null;
          answer?: string | null;
          answered_at?: string | null;
          status?: 'pending' | 'answered';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          content?: string;
          password_hash?: string | null;
          answer?: string | null;
          answered_at?: string | null;
          status?: 'pending' | 'answered';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inquiries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      shop_info: {
        Row: {
          id: number;
          name: string;
          address: string;
          phone: string;
          kakao_url: string | null;
          instagram_url: string | null;
          hours: Json;
          parking_info: string | null;
          map_lat: number | null;
          map_lng: number | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name?: string;
          address?: string;
          phone?: string;
          kakao_url?: string | null;
          instagram_url?: string | null;
          hours?: Json;
          parking_info?: string | null;
          map_lat?: number | null;
          map_lng?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          address?: string;
          phone?: string;
          kakao_url?: string | null;
          instagram_url?: string | null;
          hours?: Json;
          parking_info?: string | null;
          map_lat?: number | null;
          map_lng?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      confirm_reservation: {
        Args: {
          p_reservation_id: string;
          p_admin_note?: string;
        };
        Returns: undefined;
      };
      reject_reservation: {
        Args: {
          p_reservation_id: string;
          p_admin_note?: string;
        };
        Returns: undefined;
      };
      cancel_reservation: {
        Args: {
          p_reservation_id: string;
        };
        Returns: undefined;
      };
      get_event_status: {
        Args: {
          p_start_date: string;
          p_end_date: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// 편의 타입 별칭
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// 도메인 타입
export type Profile = Tables<'profiles'>;
export type Service = Tables<'services'>;
export type TimeSlot = Tables<'time_slots'>;
export type BlockedDate = Tables<'blocked_dates'>;
export type Reservation = Tables<'reservations'>;
export type Gallery = Tables<'gallery'>;
export type Review = Tables<'reviews'>;
export type Event = Tables<'events'>;
export type Inquiry = Tables<'inquiries'>;
export type ShopInfo = Tables<'shop_info'>;

export type ServiceCategory = Service['category'];
export type ReservationStatus = Reservation['status'];
export type InquiryStatus = Inquiry['status'];
export type UserRole = Profile['role'];
