'use client';

import Link from 'next/link';
import { BellIcon, Search } from 'lucide-react';
import { getInitials, getGreeting } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';

import { useState, useEffect } from 'react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function Header({ title, showSearch = false }: HeaderProps) {
  const { unreadCount } = useNotifications();
  const profile = useAuthStore(state => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-100 h-16 flex items-center px-4 md:px-6 gap-4">
      {/* Title or Greeting */}
      <div className="flex-1 min-w-0" suppressHydrationWarning>
        {title ? (
          <h1 className="text-heading-md text-neutral-900 font-semibold truncate">{title}</h1>
        ) : (
          <div className={!mounted ? 'opacity-0' : 'opacity-100 transition-opacity'}>
            <p className="text-body-sm text-neutral-500">{getGreeting()},</p>
            <p className="text-heading-md font-semibold text-neutral-900 truncate leading-tight">
              {mounted ? (profile?.nama?.split(' ')[0] || 'User') : 'User'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            aria-label="Cari"
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ''}`}
        >
          <BellIcon size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-600 ring-2 ring-white" />
          )}
        </Link>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary-200 transition-all">
          {mounted ? getInitials(profile?.nama || 'U') : 'U'}
        </div>
      </div>
    </header>
  );
}
