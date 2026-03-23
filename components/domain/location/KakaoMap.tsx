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

function extractBaseAddress(address: string): string {
  const match = address.match(/^(.+\d+(?:-\d+)?)/);
  return match?.[1] ?? address;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Script load failed'));
    document.head.appendChild(script);
  });
}

export function KakaoMap({ address, name, appKey }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        await loadScript(src);

        if (cancelled || !mapRef.current) return;

        window.kakao.maps.load(() => {
          if (cancelled || !mapRef.current) return;

          const geocoder = new window.kakao.maps.services.Geocoder();
          const baseAddress = extractBaseAddress(address);

          geocoder.addressSearch(baseAddress, (result, geoStatus) => {
            if (cancelled || !mapRef.current) return;

            if (geoStatus === window.kakao.maps.services.Status.OK && result[0]) {
              createMap(parseFloat(result[0].y), parseFloat(result[0].x));
              return;
            }

            // fallback: 키워드 검색
            const places = new window.kakao.maps.services.Places();
            places.keywordSearch(baseAddress, (placeResult, placeStatus) => {
              if (cancelled || !mapRef.current) return;

              if (placeStatus === window.kakao.maps.services.Status.OK && placeResult[0]) {
                createMap(parseFloat(placeResult[0].y), parseFloat(placeResult[0].x));
              } else {
                setStatus('error');
              }
            });
          });
        });
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    const createMap = (lat: number, lng: number) => {
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
        <p className="font-ui text-gray text-sm">주소를 지도에서 찾을 수 없습니다.</p>
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
