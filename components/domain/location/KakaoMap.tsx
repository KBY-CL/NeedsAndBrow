'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface KakaoMapProps {
  address: string;
  name: string;
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

// 도로명 주소 부분만 추출 (건물명, 층수 등 제거)
function extractBaseAddress(address: string): string {
  // "서울 강서구 화곡로54길 43 근린생활시설동 2층" → "서울 강서구 화곡로54길 43"
  const match = address.match(/^(.+\d+(?:-\d+)?)/);
  return match?.[1] ?? address;
}

export function KakaoMap({ address, name }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [error, setError] = useState(false);

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
  };

  const initMap = () => {
    if (!mapRef.current || initializedRef.current) return;
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current || initializedRef.current) return;
      initializedRef.current = true;

      const geocoder = new window.kakao.maps.services.Geocoder();
      const baseAddress = extractBaseAddress(address);

      // 1차: 도로명 주소 검색
      geocoder.addressSearch(baseAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          createMap(parseFloat(result[0].y), parseFloat(result[0].x));
          return;
        }

        // 2차: 키워드 검색 (매장명 + 주소)
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch(`${name} ${baseAddress}`, (placeResult, placeStatus) => {
          if (placeStatus === window.kakao.maps.services.Status.OK && placeResult[0]) {
            createMap(parseFloat(placeResult[0].y), parseFloat(placeResult[0].x));
            return;
          }

          // 3차: 주소만으로 키워드 검색
          places.keywordSearch(baseAddress, (lastResult, lastStatus) => {
            if (lastStatus === window.kakao.maps.services.Status.OK && lastResult[0]) {
              createMap(parseFloat(lastResult[0].y), parseFloat(lastResult[0].x));
            } else {
              setError(true);
            }
          });
        });
      });
    });
  };

  useEffect(() => {
    if (window.kakao?.maps) {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="bg-cream border-gray-light mb-8 flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border">
        <p className="font-ui text-gray text-sm">주소를 지도에서 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={initMap}
      />
      <div
        ref={mapRef}
        className="border-gray-light mb-8 aspect-[16/9] overflow-hidden rounded-xl border"
      />
    </>
  );
}
