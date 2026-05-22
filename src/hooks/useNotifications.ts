import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '@/actions/notifications.actions';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const data = await getNotifications();
      setNotifications(data as NotificationItem[]);
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markNotificationRead(id);
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    for (const n of unread) {
      await markNotificationRead(n.id);
    }
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.is_read).length,
    loading,
    markAsRead,
    markAllRead
  };
}
