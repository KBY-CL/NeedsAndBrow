'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Image, CalendarDays, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/gallery', label: '갤러리', icon: Image },
  { href: '/reservation', label: '예약', icon: CalendarDays },
  { href: '/reviews', label: '후기', icon: MessageSquare },
  { href: '/mypage', label: 'MY', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-gray-light fixed right-0 bottom-0 left-0 z-40 border-t bg-white/90 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'font-ui flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] transition-colors',
                isActive ? 'text-gold-dark font-semibold' : 'text-gray',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
