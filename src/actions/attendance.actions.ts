'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateDistance } from '@/features/attendance/utils/geo.utils'
import { validateStaticQR } from '@/features/attendance/services/qr.service'
import { getWibTodayStart, getWibTodayEnd, getWibCurrentHour, getWibMonthBoundaries } from '@/lib/date.utils'
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
    .select('lokasi_kantor, offices(nama, latitude, longitude, radius)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !profile.offices) {
    return { error: 'Lokasi kantor belum disetting untuk profil Anda. Harap hubungi admin.' }
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

  // 5. Prevent Duplicate Check-In for Today (WIB boundaries)
  const todayStart = getWibTodayStart()
  const todayEnd = getWibTodayEnd()

  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id, check_out')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .single()

  if (existingAttendance) {
    if (existingAttendance.check_out) {
      return { error: 'User sudah melakukan absen sebelumnya.' }
    } else {
      // Check out
      const { error: updateError } = await supabase
        .from('attendance')
        .update({ check_out: new Date().toISOString() })
        .eq('id', existingAttendance.id)
        
      if (updateError) {
        console.error(updateError)
        return { error: 'Gagal memproses absen keluar' }
      }
      return { success: true, message: 'Absen keluar berhasil', type: 'keluar', time: new Date().toISOString(), office_name: office.nama }
    }
  }

  // 6. Insert Attendance Record
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
    console.error(insertError)
    return { error: 'Gagal menyimpan absensi' }
  }

  return { success: true, message: 'Absensi berhasil', type: 'masuk', time: now, office_name: office.nama }
}

export async function getAttendanceHistory(monthYyyyMm: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Calculate start and end of the requested month in WIB
  const { startDate, endDate } = getWibMonthBoundaries(monthYyyyMm)

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('check_in', startDate)
    .lte('check_in', endDate)
    .order('check_in', { ascending: false })

  return data || []
}

export async function submitIzin(payload: { type: 'Izin' | 'Sakit', reason: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Prevent Duplicate Izin for Today (WIB boundaries)
  const todayStart = getWibTodayStart()
  const todayEnd = getWibTodayEnd()

  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .single()

  if (existingAttendance) {
    return { error: 'Anda sudah melakukan absensi hari ini.' }
  }

  const { error } = await supabase
    .from('attendance')
    .insert({
      user_id: user.id,
      check_in: new Date().toISOString(),
      status: payload.type,
      notes: payload.reason,
      location: '-', // Explicitly set or let default
      accuracy: 0,
    })

  if (error) {
    console.error(error)
    return { error: 'Gagal mengajukan izin' }
  }

  return { success: true, message: `Berhasil mengajukan ${payload.type}` }
}
