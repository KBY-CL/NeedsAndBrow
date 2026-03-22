import type { UserRole } from '@/types/database.types';

export type AuthProvider = 'google';

export type AuthResult<T = void> = { success: true; data: T } | { success: false; error: string };

export type { UserRole };
