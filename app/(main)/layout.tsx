'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileMenu } from '@/components/layout/MobileMenu';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="bg-cream flex min-h-screen flex-col">
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={handleMenuClose} />

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      <Footer />
      <BottomNav />
    </div>
  );
}
