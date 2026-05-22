'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

const TYPE_STYLES = {
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-danger-50 text-danger-600',
};

function formatNotifTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function NotificationItem({
  item,
  onMarkRead,
}: {
  item: Notification;
  onMarkRead: (id: string) => void;
}) {
  const Icon = TYPE_ICONS[item.type];
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !item.isRead && onMarkRead(item.id)}
      className={cn(
        'card p-4 w-full text-left transition-colors',
        !item.isRead && 'border-primary-100 bg-primary-50/30'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', TYPE_STYLES[item.type])}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-body-md font-semibold', item.isRead ? 'text-neutral-700' : 'text-neutral-900')}>
              {item.title}
            </p>
            {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" />}
          </div>
          <p className="text-body-sm text-neutral-500 mt-0.5 leading-relaxed">{item.body}</p>
          <p className="text-[11px] text-neutral-400 mt-2">{formatNotifTime(item.createdAt)}</p>
        </div>
      </div>
    </motion.button>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.isRead).length;

  const markRead = (id: string) => {
    setNotifications((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-lg text-neutral-900">Notifikasi</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">
            {unread > 0 ? `${unread} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unread > 0 && (
          <button type="button" onClick={markAllRead} className="btn btn-ghost btn-sm text-primary-600">
            <CheckCheck size={16} /> Tandai semua
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState variant="notifications" />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n, i) => (
            <motion.div key={n.id} transition={{ delay: i * 0.04 }}>
              <NotificationItem item={n} onMarkRead={markRead} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
