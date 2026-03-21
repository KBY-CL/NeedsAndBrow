import { createServerClient } from '@/lib/supabase/server';
import { WriteInquiryForm } from './WriteInquiryForm';

export default async function WriteInquiryPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialPhone: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .single();
    initialPhone = profile?.phone ?? null;
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <h1 className="font-display text-charcoal mb-6 text-2xl">상담 문의</h1>
      <WriteInquiryForm initialPhone={initialPhone} />
    </div>
  );
}
