'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  Image,
  CalendarDays,
  MessageSquare,
  Tag,
  MapPin,
  HelpCircle,
  Sparkles,
  LogIn,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/gallery', label: 'Before & After', icon: Image },
  { href: '/price', label: '가격표', icon: Tag },
  { href: '/reservation', label: '예약하기', icon: CalendarDays },
  { href: '/reviews', label: '시술 후기', icon: MessageSquare },
  { href: '/events', label: '이벤트', icon: Sparkles },
  { href: '/inquiry', label: '상담 문의', icon: HelpCircle },
  { href: '/location', label: '오시는 길', icon: MapPin },
] as const;

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { profile, isAdmin } = useAuthStore();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide panel */}
      <div
        className={cn(
          'shadow-modal fixed inset-y-0 right-0 z-50 w-72 bg-white transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
      >
        {/* Close button */}
        <div className="flex h-14 items-center justify-end px-4">
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            aria-label="메뉴 닫기"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* Menu items */}
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            {menuItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'font-ui flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-cream text-gold-dark font-semibold'
                        : 'text-charcoal-light hover:bg-cream-dark',
                    )}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Auth section */}
        <div className="border-gray-light mx-4 mt-4 border-t pt-4">
          {profile ? (
            <div className="space-y-1">
              <Link
                href="/mypage"
                className="font-ui text-charcoal-light hover:bg-cream-dark flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors"
              >
                <User size={18} strokeWidth={1.5} />
                마이페이지
              </Link>
              {isAdmin() && (
                <Link
                  href="/admin"
                  className="font-ui text-charcoal-light hover:bg-cream-dark flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors"
                >
                  <Settings size={18} strokeWidth={1.5} />
                  관리자
                </Link>
              )}
              <a
                href="/api/auth/logout"
                className="font-ui hover:bg-cream-dark flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500 transition-colors"
              >
                <LogOut size={18} strokeWidth={1.5} />
                로그아웃
              </a>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-ui text-charcoal-light hover:bg-cream-dark flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors"
            >
              <LogIn size={18} strokeWidth={1.5} />
              로그인 / 회원가입
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
