-- 마이그레이션 20260321000002에서 기존 서비스를 비활성화만 하고
-- 동일한 이름으로 새 서비스를 insert 하여 중복 발생.
-- 예약이 연결된 구버전은 삭제 불가하므로 숨김(is_hidden) 처리.

-- 비활성화된 서비스 중 같은 이름의 활성 서비스가 존재하는 경우 숨김 처리
UPDATE public.services s
SET is_hidden = true
WHERE s.is_active = false
  AND EXISTS (
    SELECT 1 FROM public.services s2
    WHERE s2.name = s.name
      AND s2.is_active = true
      AND s2.id != s.id
  );

-- 비활성화된 서비스 중 같은 이름의 활성 서비스가 없는 경우 (고유한 구버전)도 숨김 처리
UPDATE public.services
SET is_hidden = true
WHERE is_active = false;
