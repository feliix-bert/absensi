'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [notificationsRes, remindersRes] = await Promise.all([
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .not('due_date', 'is', null)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5)
  ]);

  const standardNotifications = notificationsRes.data || [];
  
  const upcomingReminders = (remindersRes.data || []).map(r => ({
    id: `reminder-${r.id}`, // prefix to avoid id clash
    user_id: r.user_id,
    title: 'Tenggat Waktu Tugas Mendekat',
    message: r.title,
    type: 'reminder',
    is_read: false,
    created_at: new Date().toISOString() // Show at top
  }));

  const merged = [...upcomingReminders, ...standardNotifications].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return merged.slice(0, 50);
}

export async function markNotificationRead(id: string) {
  if (id.startsWith('reminder-')) return; // Do not update fake notifications
  
  const supabase = await createClient()
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  revalidatePath('/', 'layout')
}
