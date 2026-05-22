'use client';

import { motion } from 'framer-motion';
import { CheckCheck, Info, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { useNotifications, NotificationItem as NotifItemType } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/EmptyState';

const TYPE_ICONS: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  attendance: CheckCircle2,
  reminder: Info,
};

const TYPE_STYLES: Record<string, string> = {
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-danger-50 text-danger-600',
  attendance: 'bg-primary-50 text-primary-600',
  reminder: 'bg-amber-50 text-amber-600',
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
  item: NotifItemType;
  onMarkRead: (id: string) => void;
}) {
  const Icon = TYPE_ICONS[item.type] || Info;
  const style = TYPE_STYLES[item.type] || TYPE_STYLES.info;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !item.is_read && onMarkRead(item.id)}
      className={cn(
        'card p-4 w-full text-left transition-colors',
        !item.is_read && 'border-primary-100 bg-primary-50/30'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', style)}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn('text-body-md font-semibold', item.is_read ? 'text-neutral-700' : 'text-neutral-900')}>
              {item.title}
            </p>
            {!item.is_read && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" />}
          </div>
          <p className="text-body-sm text-neutral-500 mt-0.5 leading-relaxed">{item.message}</p>
          <p className="text-[11px] text-neutral-400 mt-2">{formatNotifTime(item.created_at)}</p>
        </div>
      </div>
    </motion.button>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-lg text-neutral-900">Notifikasi</h2>
          <p className="text-body-sm text-neutral-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="btn btn-ghost btn-sm text-primary-600">
            <CheckCheck size={16} /> Tandai semua
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10 text-primary-600">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState variant="notifications" />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n, i) => (
            <motion.div key={n.id} transition={{ delay: i * 0.04 }}>
              <NotificationItem item={n} onMarkRead={markAsRead} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
