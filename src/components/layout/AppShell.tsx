'use client';

import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { PageTransition } from './PageTransition';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  showSearch?: boolean;
  className?: string;
}

export function AppShell({ children, headerTitle, showSearch, className }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* ── Desktop/Tablet Sidebar ── */}
      <Sidebar />

      {/* ── Main content area — offset by sidebar on md+ ── */}
      <div
        className={cn(
          'flex flex-col min-h-dvh transition-all duration-250',
          'md:pl-[72px] lg:pl-[260px]' // matches collapsed and expanded sidebar widths
        )}
      >
        {/* ── Top Header ── */}
        <Header title={headerTitle} showSearch={showSearch} />

        {/* ── Page content ── */}
        <main
          className={cn(
            'flex-1 px-4 py-5 md:px-6 md:py-6',
            'pb-24 md:pb-6', // bottom padding for mobile bottom nav
            className
          )}
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}
