import Link from 'next/link';
import { Phone, MapPin, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream pb-20 md:pb-0">
      <div className="mx-auto max-w-screen-lg px-5 py-10 md:px-8">
        {/* Brand */}
        <div className="mb-8">
          <span className="font-display text-xl tracking-wider text-white">Needs Ann Brow</span>
          <p className="font-ui text-gray mt-2 text-sm">속눈썹 연장 &middot; 반영구 시술 전문</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-ui text-sm font-semibold tracking-wide text-white">매장 정보</h4>
            <ul className="font-ui text-gray space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} strokeWidth={1.5} />
                <span>010-0000-0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <span>서울시 강남구 역삼동 000-00</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} strokeWidth={1.5} />
                <span>매일 10:00 - 20:00</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-ui text-sm font-semibold tracking-wide text-white">바로가기</h4>
            <ul className="font-ui text-gray space-y-2 text-sm">
              <FooterLink href="/gallery">갤러리</FooterLink>
              <FooterLink href="/price">가격표</FooterLink>
              <FooterLink href="/reservation">예약하기</FooterLink>
              <FooterLink href="/location">오시는 길</FooterLink>
            </ul>
          </div>

          {/* Customer */}
          <div className="space-y-3">
            <h4 className="font-ui text-sm font-semibold tracking-wide text-white">고객 서비스</h4>
            <ul className="font-ui text-gray space-y-2 text-sm">
              <FooterLink href="/inquiry">상담 문의</FooterLink>
              <FooterLink href="/reviews">시술 후기</FooterLink>
              <FooterLink href="/events">이벤트</FooterLink>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-charcoal-light font-ui text-gray mt-10 border-t pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} Needs Ann Brow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="hover:text-gold-light transition-colors">
        {children}
      </Link>
    </li>
  );
}
