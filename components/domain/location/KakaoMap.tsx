'use client';

import { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  address: string;
  name: string;
  appKey: string;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown;
        Marker: new (options: { map: unknown; position: unknown }) => unknown;
        InfoWindow: new (options: { content: string }) => {
          open: (map: unknown, marker: unknown) => void;
        };
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: Array<{ y: string; x: string }>, status: string) => void,
            ) => void;
          };
          Places: new () => {
            keywordSearch: (
              keyword: string,
              callback: (
                result: Array<{ y: string; x: string; place_name: string }>,
                status: string,
              ) => void,
            ) => void;
          };
          Status: { OK: string };
        };
      };
    };
  }
}

export function KakaoMap({ address, name, appKey }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(() =>
    appKey ? 'loading' : 'error',
  );

  useEffect(() => {
    if (!appKey) return;

    let cancelled = false;

    const init = async () => {
      try {
        // 스크립트 로드
        const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            // 이미 로드된 경우
            if (window.kakao?.maps) {
              resolve();
            } else {
              // 스크립트 태그는 있지만 로드 실패한 경우 → 재시도
              existing.remove();
              const script = document.createElement('script');
              script.src = src;
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
              document.head.appendChild(script);
            }
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
          document.head.appendChild(script);
        });

        if (cancelled || !mapRef.current || !window.kakao?.maps) return;

        // SDK 초기화
        window.kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;

          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(address, (result, geoStatus) => {
            if (cancelled || !mapRef.current) return;

            if (geoStatus === window.kakao.maps.services.Status.OK && result[0]) {
              renderMap(parseFloat(result[0].y), parseFloat(result[0].x));
              return;
            }

            // fallback: 키워드 검색
            const places = new window.kakao.maps.services.Places();
            places.keywordSearch(address, (placeResult, placeStatus) => {
              if (cancelled || !mapRef.current) return;

              if (placeStatus === window.kakao.maps.services.Status.OK && placeResult[0]) {
                renderMap(parseFloat(placeResult[0].y), parseFloat(placeResult[0].x));
              } else {
                setStatus('error');
              }
            });
          });
        });
      } catch (err) {
        console.error('[KakaoMap]', err);
        if (!cancelled) setStatus('error');
      }
    };

    const renderMap = (lat: number, lng: number) => {
      if (!mapRef.current) return;
      const coords = new window.kakao.maps.LatLng(lat, lng);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: coords,
        level: 3,
      });
      const marker = new window.kakao.maps.Marker({ map, position: coords });
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;">${name}</div>`,
      });
      infoWindow.open(map, marker);
      setStatus('ready');
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [address, name, appKey]);

  if (status === 'error') {
    return (
      <div className="bg-cream border-gray-light mb-8 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border">
        <p className="font-ui text-gray text-sm">지도를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative mb-8">
      {status === 'loading' && (
        <div className="bg-cream border-gray-light absolute inset-0 z-10 flex items-center justify-center rounded-xl border">
          <div className="border-gold h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
      <div
        ref={mapRef}
        className="border-gray-light aspect-[16/9] overflow-hidden rounded-xl border"
      />
    </div>
  );
}
