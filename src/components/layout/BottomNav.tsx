'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, QrCode, History, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', href: '/history', icon: History },
  { id: 'scan', label: 'Scan', href: '/scan', icon: QrCode, primary: true },
  { id: 'notifications', label: 'Notifs', href: '/notifications', icon: Bell, badge: true },
  { id: 'profile', label: 'Profile', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { unreadCount, fetchNotifications, initRealtime } = useNotifications();
  const { profile, user } = useAuthStore();

  useEffect(() => {
    if (profile) {
      fetchNotifications();
    }
    if (user?.id) {
      initRealtime(user.id);
    }
  }, [fetchNotifications, initRealtime, profile, user?.id]);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-bottom"
      style={{ height: 'var(--bottom-nav-height)' }}
      aria-label="Main navigation"
    >
      <div className="flex items-center h-full px-2">
        {NAV_ITEMS.map((tab) => {
          const isActive =
            pathname === tab.href ||
            pathname.startsWith(tab.href + '/') ||
            (tab.id === 'scan' && (pathname === '/scan' || pathname.startsWith('/scan/')));
          const Icon = tab.icon;

          if (tab.primary) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                id={`nav-${tab.id}`}
                className="flex-1 flex flex-col items-center justify-center"
                aria-label={tab.label}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    'w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-md transition-colors',
                    isActive
                      ? 'bg-primary-600 shadow-primary-200'
                      : 'bg-primary-600 shadow-primary-200'
                  )}
                >
                  <Icon size={22} className="text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href}
              id={`nav-${tab.id}`}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 relative"
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? 'text-primary-600' : 'text-neutral-400'
                  )}
                />
                {tab.badge && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-150',
                  isActive ? 'text-primary-600' : 'text-neutral-400'
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
