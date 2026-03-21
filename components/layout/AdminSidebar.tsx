'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Image,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Store,
  Clock,
  Users,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems: ReadonlyArray<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/admin/reservations', label: '예약 관리', icon: CalendarDays },
  { href: '/admin/services', label: '서비스 관리', icon: Scissors },
  { href: '/admin/time-slots', label: '시간 슬롯', icon: Clock },
  { href: '/admin/gallery', label: '갤러리', icon: Image },
  { href: '/admin/reviews', label: '후기 관리', icon: MessageSquare },
  { href: '/admin/events', label: '이벤트', icon: Sparkles },
  { href: '/admin/inquiries', label: '상담 문의', icon: HelpCircle },
  { href: '/admin/shop', label: '매장 정보', icon: Store },
  { href: '/admin/members', label: '회원 관리', icon: Users },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul className="space-y-0.5">
      {sidebarItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={cn(
                'font-ui flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-gold/20 text-gold-light font-semibold'
                  : 'text-gray hover:bg-charcoal-light hover:text-white',
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="bg-charcoal fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between px-4 md:hidden">
        <Link href="/admin" className="font-display text-sm tracking-wider text-white">
          Needs Ann Brow Admin
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="text-gray hover:text-gold-light flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
            사이트
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/10"
            aria-label="메뉴 열기"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'bg-charcoal fixed top-0 left-0 z-50 flex h-screen w-64 flex-col transition-transform duration-300 md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-charcoal-light flex h-14 shrink-0 items-center justify-between border-b px-5">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="font-display text-sm tracking-wider text-white"
          >
            Needs Ann Brow Admin
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-gray rounded-lg p-1 transition-colors hover:text-white"
            aria-label="메뉴 닫기"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavItems pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </nav>
        <div className="border-charcoal-light border-t px-3 py-4">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="font-ui text-gray hover:text-gold-light flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="bg-charcoal hidden h-screen w-60 shrink-0 flex-col md:flex">
        <div className="border-charcoal-light flex h-14 items-center border-b px-5">
          <Link href="/admin" className="font-display text-sm tracking-wider text-white">
            Needs Ann Brow Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavItems pathname={pathname} />
        </nav>
        <div className="border-charcoal-light border-t px-3 py-4">
          <Link
            href="/"
            className="font-ui text-gray hover:text-gold-light flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>
    </>
  );
}
