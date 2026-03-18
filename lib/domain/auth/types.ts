import type { Profile, UserRole } from '@/types/database.types';

export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  profile: Profile | null;
};

export type AuthProvider = 'kakao' | 'google';

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type OtpSignupInput = {
  name: string;
  phone: string;
};

export type ResetPasswordInput = {
  email: string;
};

export type UpdatePasswordInput = {
  password: string;
};

export type AuthResult<T = void> = { success: true; data: T } | { success: false; error: string };

export type { UserRole };
