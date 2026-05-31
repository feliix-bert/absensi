'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateDistance } from '@/features/attendance/utils/geo.utils'
import { validateStaticQR } from '@/features/attendance/services/qr.service'
import { getWibTodayStart, getWibTodayEnd, getWibCurrentHour, getWibMonthBoundaries } from '@/lib/date.utils'
import { revalidatePath } from 'next/cache'

interface AttendancePayload {
  latitude: number
  longitude: number
  accuracy: number
  qrToken: string
}

export async function submitCheckIn(payload: AttendancePayload) {
  const supabase = await createClient()
  
  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // 2. Validate QR Token
  const qrValidation = validateStaticQR(payload.qrToken)
  if (!qrValidation.isValid) {
    return { error: qrValidation.reason || 'Invalid or expired QR Code' }
  }

  // 3. Fetch Profile and Office Location
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('lokasi_kantor, offices(nama, latitude, longitude, radius)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.offices) {
    console.error('Profile fetch error:', profileError)
    return { error: 'Office location is not set for your profile. Please contact admin.' }
  }

  // @ts-ignore - Supabase type inference for joined tables
  const office = Array.isArray(profile.offices) ? profile.offices[0] : profile.offices

  // 4. Validate Location (Geofencing)
  const distance = calculateDistance(
    payload.latitude,
    payload.longitude,
    office.latitude,
    office.longitude
  )

  if (distance > office.radius) {
    return { error: `You are outside the office area. Your distance: ${Math.round(distance)} meters (Maximum: ${office.radius} meters)` }
  }

  if (payload.accuracy > 100) {
    return { error: 'GPS accuracy is too low. Make sure you are outdoors or have a good GPS signal.' }
  }

  // 5. Prevent Duplicate Check-In for Today (WIB boundaries)
  const todayStart = getWibTodayStart()
  const todayEnd = getWibTodayEnd()

  const { data: existingAttendance, error: findError } = await supabase
    .from('attendance')
    .select('id, check_out')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .maybeSingle()  // Use maybeSingle to avoid error when no record exists

  if (findError) {
    console.error('Find existing attendance error:', findError)
    return { error: 'Failed to check today\'s attendance data' }
  }

  if (existingAttendance) {
    if (existingAttendance.check_out) {
      return { error: 'You have already checked in and out today.' }
    } else {
      // Check out — update existing record
      if (getWibCurrentHour() < 17) {
        return { error: 'Check-out is only allowed after 17:00 WIB.' }
      }
      
      const { error: updateError } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', existingAttendance.id)
        
      if (updateError) {
        console.error('Check-out update error:', updateError)
        return { error: 'Failed to process check-out' }
      }

      // Revalidate dashboard and history so next navigation shows fresh data
      revalidatePath('/dashboard')
      revalidatePath('/history')

      return { success: true, message: 'Check-out successful', type: 'keluar', time: new Date().toISOString(), office_name: office.nama }
    }
  }

  // 6. Insert new Attendance Record (Absen Masuk)
  const now = new Date().toISOString()
  const { error: insertError } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      check_in: now,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      status: getWibCurrentHour() >= 9 ? 'Terlambat' : 'Hadir',
      qr_token: payload.qrToken
    })

  if (insertError) {
    console.error('Check-in insert error:', insertError)
    return { error: `Failed to save attendance: ${insertError.message}` }
  }

  // Revalidate dashboard and history so next navigation shows fresh data
  revalidatePath('/dashboard')
  revalidatePath('/history')

  return { success: true, message: 'Attendance successful', type: 'masuk', time: now, office_name: office.nama }
}

export async function getAttendanceHistory(monthYyyyMm: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Calculate start and end of the requested month in WIB
  const { startDate, endDate } = getWibMonthBoundaries(monthYyyyMm)

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('check_in', startDate)
    .lte('check_in', endDate)
    .order('check_in', { ascending: false })

  if (error) {
    console.error('getAttendanceHistory error:', error)
    return []
  }

  return data || []
}

export async function submitIzin(payload: { type: 'Izin' | 'Sakit', reason: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Prevent Duplicate Izin for Today (WIB boundaries)
  const todayStart = getWibTodayStart()
  const todayEnd = getWibTodayEnd()

  const { data: existingAttendance, error: findError } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .maybeSingle()  // Use maybeSingle to avoid PGRST116 error

  if (findError) {
    console.error('Find existing attendance error:', findError)
    return { error: 'Failed to check today\'s attendance data' }
  }

  if (existingAttendance) {
    return { error: 'You have already recorded attendance today.' }
  }

  const { error } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      check_in: new Date().toISOString(),
      status: payload.type,
      notes: payload.reason,
      // GPS fields are nullable (no physical location for izin/sakit)
      latitude: null,
      longitude: null,
      accuracy: null,
      qr_token: null,
    })

  if (error) {
    console.error('submitIzin insert error:', error)
    return { error: `Failed to submit request: ${error.message}` }
  }

  // Revalidate dashboard and history
  revalidatePath('/dashboard')
  revalidatePath('/history')

  return { success: true, message: `Successfully submitted ${payload.type}` }
}
