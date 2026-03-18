'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { profile, isLoading } = useAuthStore();

  return (
    <header className="border-gray-light sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-display text-charcoal text-lg tracking-wider">
            Beauty Lash &amp; Brow
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/gallery">갤러리</NavLink>
          <NavLink href="/reviews">후기</NavLink>
          <NavLink href="/price">가격표</NavLink>
          <NavLink href="/events">이벤트</NavLink>
          <NavLink href="/reservation">예약</NavLink>
          <NavLink href="/location">오시는 길</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {!isLoading && profile && (
            <Link
              href="/mypage"
              className="text-charcoal-light hover:text-charcoal flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              aria-label="마이페이지"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}
          {!isLoading && !profile && (
            <Link
              href="/login"
              className="font-ui text-charcoal-light hover:text-charcoal text-sm font-medium transition-colors"
            >
              로그인
            </Link>
          )}
          <button
            type="button"
            onClick={onMenuOpen}
            className="text-charcoal-light hover:text-charcoal flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden"
            aria-label="메뉴 열기"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-ui text-charcoal-light hover:text-gold text-sm font-medium tracking-wide transition-colors"
    >
      {children}
    </Link>
  );
}
