'use client';

import { useEffect, useRef } from 'react';
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
          Status: { OK: string };
        };
      };
    };
  }
}

export function KakaoMap({ address, name }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const initMap = () => {
    if (!mapRef.current || initializedRef.current) return;
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current || initializedRef.current) return;
      initializedRef.current = true;

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(address, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !result[0]) return;
        if (!mapRef.current) return;

        const coords = new window.kakao.maps.LatLng(
          parseFloat(result[0].y),
          parseFloat(result[0].x),
        );

        const map = new window.kakao.maps.Map(mapRef.current, {
          center: coords,
          level: 3,
        });

        const marker = new window.kakao.maps.Marker({ map, position: coords });

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;">${name}</div>`,
        });
        infoWindow.open(map, marker);
      });
    });
  };

  useEffect(() => {
    if (window.kakao?.maps) {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
