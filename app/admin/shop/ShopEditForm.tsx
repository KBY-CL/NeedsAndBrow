'use client';

import { useActionState } from 'react';
import { updateShopInfo } from '@/lib/actions/shop';

interface ShopData {
  name: string;
  address: string;
  phone: string;
  parking_info: string | null;
  kakao_url: string | null;
  instagram_url: string | null;
  hours_text: string;
}

export function ShopEditForm({ shop }: { shop: ShopData }) {
  const [state, action, isPending] = useActionState(updateShopInfo, null);

  return (
    <form action={action} className="space-y-5">
      <Field label="매장명" name="name" defaultValue={shop.name} required />
      <Field label="주소" name="address" defaultValue={shop.address} />
      <Field label="전화번호" name="phone" defaultValue={shop.phone} />
      <Field label="위치 안내" name="parking_info" defaultValue={shop.parking_info ?? ''} />
      <Field
        label="네이버 URL"
        name="kakao_url"
        defaultValue={shop.kakao_url ?? ''}
        placeholder="https://map.naver.com/..."
      />
      <Field
        label="인스타그램 URL"
        name="instagram_url"
        defaultValue={shop.instagram_url ?? ''}
        placeholder="https://instagram.com/..."
      />

      <div>
        <label htmlFor="hours" className="font-ui text-charcoal mb-1 block text-sm font-medium">
          운영시간
        </label>
        <textarea
          id="hours"
          name="hours"
          rows={3}
          defaultValue={shop.hours_text}
          placeholder={'월-일 10:00 - 20:00\n공휴일 휴무'}
          className="font-ui text-charcoal border-gray-light focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
        />
        <p className="font-ui text-gray mt-1 text-xs">
          입력한 내용이 그대로 표시됩니다. 줄바꿈으로 구분하세요.
        </p>
      </div>

      {state?.success && <p className="font-ui text-success text-sm">저장되었습니다.</p>}
      {state && !state.success && <p className="font-ui text-error text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="font-ui bg-gold hover:bg-gold-dark h-10 rounded-lg px-6 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="font-ui text-charcoal mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="font-ui text-charcoal border-gray-light focus:border-gold focus:ring-gold/30 w-full rounded-lg border px-4 py-3 text-sm focus:ring-1"
      />
    </div>
  );
}
