-- 당근마켓 URL 컬럼 추가
ALTER TABLE public.shop_info
  ADD COLUMN IF NOT EXISTS daangn_url text;
