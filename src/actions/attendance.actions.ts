'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateDistance } from '@/features/attendance/utils/geo.utils'
import { validateStaticQR } from '@/features/attendance/services/qr.service'
import { startOfDay, endOfDay } from 'date-fns'

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
    return { error: qrValidation.reason || 'QR Code tidak valid atau kadaluarsa' }
  }

  // 3. Fetch Profile and Office Location
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('lokasi_kantor, offices(latitude, longitude, radius)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.offices) {
    return { error: 'Data lokasi kantor tidak ditemukan untuk pengguna ini' }
  }

  // @ts-ignore - Supabase type inference for joined tables can be tricky sometimes
  const office = Array.isArray(profile.offices) ? profile.offices[0] : profile.offices

  // 4. Validate Location (Geofencing)
  const distance = calculateDistance(
    payload.latitude,
    payload.longitude,
    office.latitude,
    office.longitude
  )

  if (distance > office.radius) {
    return { error: `Anda berada di luar area kantor. Jarak Anda: ${Math.round(distance)} meter (Maksimal: ${office.radius} meter)` }
  }

  if (payload.accuracy > 100) {
    return { error: 'Akurasi GPS terlalu rendah. Pastikan Anda berada di luar ruangan atau memiliki sinyal GPS yang baik.' }
  }

  // 5. Prevent Duplicate Check-In for Today
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()

  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .single()

  if (existingAttendance) {
    return { error: 'Anda sudah melakukan absensi masuk hari ini' }
  }

  // 6. Insert Attendance Record
  const { error: insertError } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      check_in: new Date().toISOString(),
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      status: 'Hadir', // Basic logic, could be enhanced with time checks for 'Terlambat'
      qr_token: payload.qrToken
    })

  if (insertError) {
    console.error(insertError)
    return { error: 'Gagal menyimpan absensi' }
  }

  return { success: true, message: 'Absensi berhasil' }
}

export async function getAttendanceHistory(monthYyyyMm: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Calculate start and end of the requested month
  const [year, month] = monthYyyyMm.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString()

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('check_in', startDate)
    .lte('check_in', endDate)
    .order('check_in', { ascending: false })

  return data || []
}
