'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Save a 128-float face descriptor for the authenticated user.
 * Overwrites any existing descriptor (re-enrollment).
 */
export async function saveFaceDescriptor(descriptor: number[]): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Tidak terautentikasi' };

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return { error: 'Deskriptor wajah tidak valid' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      face_descriptor: descriptor,
      face_enrolled_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('saveFaceDescriptor error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Fetch the stored face descriptor for the current authenticated user.
 * Returns null if not enrolled or not authenticated.
 */
export async function getFaceDescriptor(): Promise<number[] | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('face_descriptor')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('getFaceDescriptor error:', error);
    return null;
  }

  return (data?.face_descriptor as number[]) ?? null;
}
