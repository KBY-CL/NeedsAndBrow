'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

interface HeaderProps {
  onMenuOpen: () => void;
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { profile, isLoading, isAdmin } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="border-gray-light sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-display text-charcoal text-lg tracking-wider">Needs Ann Brow</span>
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
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="text-charcoal-light hover:text-charcoal flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                aria-label="사용자 메뉴"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                  <Link
                    href="/mypage"
                    className="font-ui text-charcoal-light hover:bg-cream flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={16} strokeWidth={1.5} />
                    마이페이지
                  </Link>
                  {isAdmin() && (
                    <Link
                      href="/admin"
                      className="font-ui text-charcoal-light hover:bg-cream flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings size={16} strokeWidth={1.5} />
                      관리자
                    </Link>
                  )}
                  <a
                    href="/api/auth/logout"
                    className="font-ui flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} strokeWidth={1.5} />
                    로그아웃
                  </a>
                </div>
              )}
            </div>
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
