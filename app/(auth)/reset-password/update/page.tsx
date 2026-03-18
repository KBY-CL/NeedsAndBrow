import type { Metadata } from 'next';
import { UpdatePasswordForm } from '@/components/domain/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: '새 비밀번호 설정',
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
