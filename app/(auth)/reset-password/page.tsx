import type { Metadata } from 'next';
import { RequestResetForm } from '@/components/domain/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: '비밀번호 찾기',
};

export default function ResetPasswordPage() {
  return <RequestResetForm />;
}
