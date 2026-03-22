'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import type { AuthProvider, AuthResult } from '@/lib/domain/auth/types';

// ─── Zod 스키마 ────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
});

const SignupSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.').max(20, '이름은 20자 이내여야 합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.'),
  phone: z
    .string()
    .regex(/^01[0-9]{8,9}$/, '올바른 휴대폰 번호 형식이 아닙니다.')
    .optional()
    .or(z.literal('')),
});

const ResetPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
});

const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.'),
});

// ─── 이메일/비밀번호 로그인 ──────────────────────────────────────

export async function loginWithEmail(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
    }
    return { success: false, error: '로그인에 실패했습니다. 다시 시도해 주세요.' };
  }

  revalidatePath('/', 'layout');
  return { success: true, data: undefined };
}

// ─── 이메일/비밀번호 회원가입 ────────────────────────────────────

export async function signupWithEmail(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone') || '',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { success: false, error: '이미 가입된 이메일입니다.' };
    }
    return { success: false, error: '회원가입에 실패했습니다. 다시 시도해 주세요.' };
  }

  return { success: true, data: undefined };
}

// ─── OAuth 로그인 URL 생성 ────────────────────────────────────────

export async function getOAuthUrl(provider: AuthProvider): Promise<AuthResult<string>> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      scopes: undefined,
    },
  });

  if (error || !data.url) {
    return { success: false, error: 'OAuth 로그인에 실패했습니다.' };
  }

  return { success: true, data: data.url };
}

// ─── 로그아웃 ─────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

// ─── 비밀번호 재설정 이메일 발송 ──────────────────────────────────

export async function sendResetPasswordEmail(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = ResetPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/update`,
  });

  if (error) {
    return { success: false, error: '이메일 발송에 실패했습니다. 다시 시도해 주세요.' };
  }

  // 이메일 존재 여부와 무관하게 성공 반환 (보안)
  return { success: true, data: undefined };
}

// ─── 비밀번호 업데이트 ───────────────────────────────────────────

export async function updatePassword(_: unknown, formData: FormData): Promise<AuthResult> {
  const parsed = UpdatePasswordSchema.safeParse({
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? '입력값을 확인하세요.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.' };
  }

  revalidatePath('/', 'layout');
  return { success: true, data: undefined };
}

// ─── 현재 사용자 프로필 조회 ──────────────────────────────────────

export async function getCurrentUserProfile() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return profile;
}
