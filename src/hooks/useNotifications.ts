import { create } from 'zustand';
import { getNotifications, markNotificationRead } from '@/actions/notifications.actions';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  loading: boolean;
  fetched: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: true,
  fetched: false,
  fetchNotifications: async () => {
    if (get().fetched) return; // Only fetch once
    set({ loading: true });
    try {
      const data = await getNotifications();
      set({ notifications: data as NotificationItem[], fetched: true });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },
  markAsRead: async (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    }));
    await markNotificationRead(id);
  },
  markAllRead: async () => {
    const unread = get().notifications.filter(n => !n.is_read);
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true }))
    }));
    for (const n of unread) {
      await markNotificationRead(n.id);
    }
  }
}));

export function useNotifications() {
  const store = useNotificationsStore();
  const unreadCount = store.notifications.filter(n => !n.is_read).length;
  return { ...store, unreadCount };
}
