'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  nama: z.string().min(2, 'Name must be at least 2 characters'),
  nim: z.string().min(3, 'NIM/NIS/Intern ID must be at least 3 characters'),
  pembimbing: z.string().min(2, 'Mentor name must be at least 2 characters'),
  mulai_magang: z.string().min(1, 'Start date is required'),
  selesai_magang: z.string().min(1, 'End date is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const updateProfileSchema = z.object({
  nama: z.string().min(2, 'Name must be at least 2 characters'),
  nim: z.string().min(3, 'NIM/NIS/Intern ID must be at least 3 characters'),
  pembimbing: z.string().min(2, 'Mentor name must be at least 2 characters'),
  mulai_magang: z.string().min(1, 'Start date is required'),
  selesai_magang: z.string().min(1, 'End date is required'),
})

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const data = Object.fromEntries(formData.entries())
  const parsed = updateProfileSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error?.issues?.[0]?.message || 'Validation failed' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function signUp(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = Object.fromEntries(formData.entries())
  const parsed = signUpSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error?.issues?.[0]?.message || 'Validation failed' }
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
    return { error: 'Email Verification is still active. Please disable "Confirm email" in Supabase Dashboard > Authentication > Providers > Email.' }
  }

  revalidatePath('/', 'layout')
  redirect('/face-enrollment') // Redirect to face enrollment step after signup
}

const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function signIn(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = Object.fromEntries(formData.entries())
  const parsed = signInSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error?.issues?.[0]?.message || 'Validation failed' }
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
