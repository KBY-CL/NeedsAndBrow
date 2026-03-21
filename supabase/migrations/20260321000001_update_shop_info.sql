-- 매장 정보 업데이트 (실제 주소 및 연락처)
update public.shop_info set
  address      = '서울 강서구 화곡로54길 43 근린생활시설동 2층',
  phone        = '0507-1489-4666',
  parking_info = '강서경찰서 뒷편 금호어울림 퍼스티어 후문 상가 2층',
  updated_at   = now()
where id = 1;
