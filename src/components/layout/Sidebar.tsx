'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  QrCode,
  ClockIcon,
  UserCircle,
  BellIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LogOut,
  History,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
  { id: 'scan', label: 'Scan Absensi', href: '/scan', icon: QrCode },
  { id: 'history', label: 'Riwayat Absensi', href: '/history', icon: History },
  { id: 'notifications', label: 'Notifikasi', href: '/notifications', icon: BellIcon },
  { id: 'profile', label: 'Profil Saya', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { unreadCount } = useNotifications();
  const profile = useAuthStore((state) => state.profile);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-neutral-200 overflow-hidden"
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-16 px-4 border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* TelIntern mark */}
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TI</span>
          </div>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="font-bold text-neutral-900 text-sm tracking-tight">TelIntern</span>
            <p className="text-[10px] text-neutral-400 leading-tight">Smart Attendance</p>
          </motion.div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'ml-auto w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0',
            collapsed && 'absolute right-2 top-4'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + '/') ||
            (item.id === 'scan' && (pathname === '/scan' || pathname.startsWith('/scan/')));
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                size={20}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'
                )}
              />

              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap text-label-lg"
              >
                {item.label}
              </motion.span>

              {item.id === 'notifications' && unreadCount > 0 && !collapsed && (
                <span className="ml-auto badge badge-danger text-[10px] px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="px-4 mb-3">
        <div className="border-t border-neutral-100" />
      </div>

      {/* ── Location Quick Status ── */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mx-3 mb-3 p-3 rounded-lg bg-success-50 border border-success-100"
        >
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-success-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-success-700 truncate">Di dalam radius</p>
              <p className="text-[10px] text-success-600 truncate">± 45 m dari kantor</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── User ── */}
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {getInitials(profile?.nama || 'U')}
          </div>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap min-w-0"
          >
            <p className="text-body-sm font-medium text-neutral-900 truncate">{profile?.nama || 'User'}</p>
            <p className="text-[11px] text-neutral-400 truncate">{profile?.divisi || '-'}</p>
          </motion.div>
        </div>
      </div>
    </motion.aside>
  );
}
