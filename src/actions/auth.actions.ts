'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(3, 'NIM/NIS/ID Magang minimal 3 karakter'),
  divisi: z.string().min(2, 'Divisi minimal 2 karakter'),
  pembimbing: z.string().min(2, 'Nama pembimbing minimal 2 karakter'),
  durasi_magang: z.string().min(1, 'Durasi magang harus diisi'),
  lokasi_kantor: z.string().uuid('Pilih lokasi kantor yang valid'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export async function signUp(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = Object.fromEntries(formData.entries())
  const parsed = signUpSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error?.issues?.[0]?.message || 'Validasi gagal' }
  }

  const { email, password, ...metadata } = parsed.data

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // This maps to raw_user_meta_data and triggers the profile creation
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Jika session kosong, berarti Supabase masih meminta verifikasi email
  if (!authData.session) {
    return { error: 'Verifikasi Email masih aktif. Silakan matikan opsi "Confirm email" di Dashboard Supabase > Authentication > Providers > Email.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

const signInSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
})

export async function signIn(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = Object.fromEntries(formData.entries())
  const parsed = signInSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error?.issues?.[0]?.message || 'Validasi gagal' }
  }

  const { email, password } = parsed.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
