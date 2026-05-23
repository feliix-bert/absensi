'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from 'date-fns'

export async function getDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at, mulai_magang, selesai_magang')
    .eq('id', user.id)
    .single()

  // 2. Get today's attendance
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()
  
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('check_in, check_out, status')
    .eq('user_id', user.id)
    .gte('check_in', todayStart)
    .lte('check_in', todayEnd)
    .single()

  // 3. Get all attendance for the current month to calculate rates
  const monthStart = startOfMonth(new Date()).toISOString()
  const monthEnd = endOfMonth(new Date()).toISOString()
  
  const { data: monthAttendance } = await supabase
    .from('attendance')
    .select('status, check_in')
    .eq('user_id', user.id)
    .gte('check_in', monthStart)
    .lte('check_in', monthEnd)
    .order('check_in', { ascending: false })

  const records = monthAttendance || []
  
  const attendedDays = records.filter(r => r.status === 'Hadir').length
  const lateDays = records.filter(r => r.status === 'Terlambat').length
  const izinDays = records.filter(r => r.status === 'Izin' || r.status === 'Sakit').length
  
  // Calculate dynamic Alpha days (past weekdays without attendance)
  let calculatedAlphaDays = 0;
  const startCalcDate = profile?.mulai_magang ? new Date(Math.max(new Date(profile.mulai_magang).getTime(), new Date(monthStart).getTime())) : new Date(monthStart);
  const endCalcDate = subDays(startOfDay(new Date()), 1); // Up to yesterday
  
  if (startCalcDate <= endCalcDate) {
    let curr = new Date(startCalcDate);
    while (curr <= endCalcDate) {
      // 0 = Sunday, 6 = Saturday
      if (curr.getDay() !== 0 && curr.getDay() !== 6) {
        const currIso = curr.toISOString().split('T')[0];
        const hasRecord = records.some(r => r.check_in.startsWith(currIso));
        if (!hasRecord) {
          calculatedAlphaDays++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  }

  const alphaDays = records.filter(r => r.status === 'Alpha').length + calculatedAlphaDays

  // Streak logic (basic)
  let streakDays = 0
  let currentDate = new Date()
  
  // Basic streak calculation: if today is not attended, check yesterday.
  // This is a simplified O(N) backward check.
  for (let i = 0; i < 30; i++) {
    const checkDate = subDays(currentDate, i)
    const start = startOfDay(checkDate).toISOString()
    const end = endOfDay(checkDate).toISOString()
    const hasAttended = records.some(r => r.check_in >= start && r.check_in <= end && (r.status === 'Hadir' || r.status === 'Terlambat'))
    
    // Ignore today if hasn't attended yet, don't break the streak
    if (i === 0 && !hasAttended) continue
    
    if (hasAttended) {
      streakDays++
    } else {
      break
    }
  }

  // Calculate attendance rate. (Attended + Late) / (Attended + Late + Alpha)
  const totalRelevant = attendedDays + lateDays + alphaDays
  const attendanceRate = totalRelevant === 0 ? 100 : Math.round(((attendedDays + lateDays) / totalRelevant) * 100)

  // Recent activity (last 5)
  const recentActivity = records.slice(0, 5).map(r => ({
    id: r.check_in,
    action: r.status === 'Hadir' || r.status === 'Terlambat' ? 'Check In' : r.status,
    time: new Date(r.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    location: 'Kantor', // Can pull real location if joined
    status: r.status
  }))

  return {
    today: todayAttendance || null,
    stats: {
      attendedDays,
      lateDays,
      izinDays,
      alphaDays,
      streakDays,
      attendanceRate,
      totalDays: profile?.selesai_magang && profile?.mulai_magang ? 
        Math.max(1, Math.ceil((new Date(profile.selesai_magang).getTime() - new Date(profile.mulai_magang).getTime()) / (1000 * 60 * 60 * 24))) 
        : 30,
    },
    recentActivity
  }
}
