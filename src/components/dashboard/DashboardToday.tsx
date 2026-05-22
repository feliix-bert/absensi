'use client';

import Link from 'next/link';
import { CalendarDays, MapPin, QrCode, ChevronRight, XCircle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface DashboardTodayProps {
  today: any
  profile: any
}

export function DashboardToday({ today, profile }: DashboardTodayProps) {
  const officeShort = profile?.offices?.nama?.split('(')[1]?.replace(')','') ?? 'kantor';
  const hasCheckedIn = !!today?.check_in;
  const hasCheckedOut = !!today?.check_out;
  const checkInTime = hasCheckedIn ? new Date(today.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;
  const checkOutTime = hasCheckedOut ? new Date(today.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="card-modern p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={18} className="text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-800">Absensi Hari Ini</h2>
        </div>
        {hasCheckedIn ? (
          <>
            <StatusBadge status={today.status ?? 'Hadir'} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="card-surface p-3">
                <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Masuk</p>
                <p className="text-lg font-bold text-neutral-900 tabular-nums mt-1">
                  {checkInTime ?? '--:--'}
                </p>
              </div>
              <div className="card-surface p-3">
                <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Keluar</p>
                <p className={`text-lg font-bold tabular-nums mt-1 ${hasCheckedOut ? 'text-neutral-900' : 'text-amber-600'}`}>
                  {checkOutTime ?? 'Belum'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <XCircle size={28} className="text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">Belum absen masuk hari ini</p>
          </div>
        )}
      </div>

      <div className="card-modern p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-800">Lokasi</h2>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Lokasi Kantor Anda</p>
            <p className="text-xs text-neutral-500 mt-0.5">{profile?.offices?.nama}</p>
          </div>
        </div>
      </div>

      <Link href="/scan" className="sm:col-span-2 block group">
        <div className="rounded-2xl bg-primary-600 p-5 flex items-center justify-between hover:bg-primary-500 transition-colors shadow-[0_8px_24px_rgba(204,0,0,0.25)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <QrCode size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold">
                {hasCheckedIn && !hasCheckedOut ? 'Absen Keluar' : 'Absen Masuk'}
              </p>
              <p className="text-white/75 text-sm mt-0.5">Tap untuk scan QR</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/70 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
