import { create } from 'zustand';
import { getNotifications, markNotificationRead } from '@/actions/notifications.actions';
import { createClient } from '@/utils/supabase/client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  due_date: string | null;
  is_completed: boolean;
}

interface NotificationsState {
  notifications: NotificationItem[];
  activeReminders: ReminderItem[];
  loading: boolean;
  fetched: boolean;
  channelInitialized: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  initRealtime: (userId: string) => void;
  checkDeadlines: () => void;
}

// Track notified reminders to avoid spamming
const notifiedReminders = new Set<string>();

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  activeReminders: [],
  loading: true,
  fetched: false,
  channelInitialized: false,

  fetchNotifications: async () => {
    if (get().fetched) return;
    set({ loading: true });
    try {
      const data = await getNotifications();
      // getNotifications already mixes in upcoming reminders initially
      set({ notifications: data as NotificationItem[], fetched: true });
      
      // Also fetch active reminders for client-side deadline checking
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: remData } = await supabase
          .from('reminders')
          .select('id, title, due_date, is_completed')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .not('due_date', 'is', null);
        if (remData) {
          set({ activeReminders: remData as ReminderItem[] });
        }
      }
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
  },

  initRealtime: (userId: string) => {
    if (get().channelInitialized) return;
    set({ channelInitialized: true });

    const supabase = createClient();

    // 1. Subscribe to Notifications (DB events like check-in/out)
    supabase.channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const newNotif = payload.new as NotificationItem;
          set(state => {
            // Prevent duplicate insertion
            if (state.notifications.some(n => n.id === newNotif.id)) return state;
            return {
              notifications: [newNotif, ...state.notifications]
            };
          });
        }
      )
      // 2. Subscribe to Reminders (To keep activeReminders up to date)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` },
        (payload) => {
          set(state => {
            let updated = [...state.activeReminders];
            if (payload.eventType === 'INSERT') {
              updated.push(payload.new as ReminderItem);
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ReminderItem;
              if (updatedItem.is_completed) {
                updated = updated.filter(r => r.id !== updatedItem.id);
              } else {
                const idx = updated.findIndex(r => r.id === updatedItem.id);
                if (idx > -1) updated[idx] = updatedItem;
                else updated.push(updatedItem);
              }
            } else if (payload.eventType === 'DELETE') {
              updated = updated.filter(r => r.id !== payload.old.id);
            }
            return { activeReminders: updated };
          });
        }
      )
      .subscribe();
      
    // 3. Setup Deadline Checker (every 60s)
    setInterval(() => {
      get().checkDeadlines();
    }, 60000);
  },

  checkDeadlines: () => {
    const state = get();
    const now = new Date().getTime();
    
    // We notify if deadline is within 1 hour
    const ONE_HOUR = 60 * 60 * 1000;
    
    state.activeReminders.forEach(reminder => {
      if (!reminder.due_date || reminder.is_completed) return;
      if (notifiedReminders.has(reminder.id)) return;
      
      const dueTime = new Date(reminder.due_date).getTime();
      const diff = dueTime - now;
      
      // If due within 1 hour and hasn't passed yet
      if (diff > 0 && diff <= ONE_HOUR) {
        notifiedReminders.add(reminder.id);
        
        const localNotification: NotificationItem = {
          id: `reminder-local-${reminder.id}`,
          title: 'Tenggat Waktu Tugas Mendekat',
          message: `Reminder: ${reminder.title} due at ${new Date(reminder.due_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
          type: 'reminder',
          is_read: false,
          created_at: new Date().toISOString()
        };
        
        set(s => {
          // Avoid duplicate
          if (s.notifications.some(n => n.id === localNotification.id)) return s;
          return { notifications: [localNotification, ...s.notifications] };
        });
      }
    });
  }
}));

export function useNotifications() {
  const store = useNotificationsStore();
  const unreadCount = store.notifications.filter(n => !n.is_read).length;
  return { ...store, unreadCount };
}
