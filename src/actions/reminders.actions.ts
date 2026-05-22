'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getReminders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function toggleReminder(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reminders')
    .update({ is_completed: !currentStatus })
    .eq('id', id)

  if (error) {
    console.error(error)
    return { error: 'Gagal mengubah status pengingat' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addReminder(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  if (!title || !title.trim()) return { error: 'Judul tidak boleh kosong' }

  const { error } = await supabase
    .from('reminders')
    .insert({ user_id: user.id, title: title.trim() })

  if (error) {
    console.error(error)
    return { error: 'Gagal menambahkan pengingat' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    return { error: 'Gagal menghapus pengingat' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
