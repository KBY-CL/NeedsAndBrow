'use client';

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-charcoal flex h-screen w-60 shrink-0 flex-col">
      {/* Brand */}
      <div className="border-charcoal-light flex h-14 items-center border-b px-5">
        <Link href="/admin" className="font-display text-sm tracking-wider text-white">
          Beauty Admin
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {sidebarItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
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
      </nav>

      {/* Back to site */}
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
  );
}
