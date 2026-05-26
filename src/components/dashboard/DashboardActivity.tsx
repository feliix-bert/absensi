'use client';

import Link from 'next/link';
import { ChevronRight, CalendarX } from 'lucide-react';

import { StatusBadge } from '@/components/shared/StatusBadge';
import type { AttendanceStatus } from '@/lib/types';

interface ActivityRecord {
  id: string;
  check_in: string;
  check_out?: string | null;
  notes?: string | null;
  status: string;
  timeIn: string;
  timeOut?: string | null;
  isLate?: boolean;
}

interface DashboardActivityProps {
  recentActivity: ActivityRecord[]
}

export function DashboardActivity({ recentActivity = [] }: DashboardActivityProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-neutral-900">Aktivitas Terkini</h2>
        <Link
          href="/history"
          className="text-sm text-primary-600 font-medium hover:underline inline-flex items-center gap-0.5"
        >
          Semua <ChevronRight size={14} />
        </Link>
      </div>
      <div className="card-modern divide-y divide-neutral-100 overflow-hidden">
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400 gap-2">
            <CalendarX size={32} className="opacity-40" />
            <p className="text-sm">Belum ada aktivitas bulan ini</p>
          </div>
        ) : (
          recentActivity.map((record) => {
            const dateObj = new Date(record.check_in);
            const dayNum = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              timeZone: 'Asia/Jakarta',
            });
            const monthStr = dateObj.toLocaleDateString('id-ID', {
              month: 'short',
              timeZone: 'Asia/Jakarta',
            });

            // Cast status safely — 'Sakit' maps to 'izin' badge, others lowercase
            const rawStatus = record.status.toLowerCase();
            const badgeStatus = (rawStatus === 'sakit' ? 'izin' : rawStatus) as AttendanceStatus;

            // Show check-in/out row for Hadir & Terlambat
            const showTimes = record.status === 'Hadir' || record.status === 'Terlambat';

            return (
              <div key={record.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50/80 transition-colors">
                {/* Date column */}
                <div className="w-11 text-center shrink-0">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                    {monthStr}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 leading-tight tabular-nums">
                    {dayNum}
                  </p>
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <StatusBadge status={badgeStatus} size="sm" />
                  </div>

                  {showTimes ? (
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-neutral-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Masuk:&nbsp;<span className="font-semibold tabular-nums">{record.timeIn || '—'}</span>
                      </span>
                      <span className="text-neutral-300">|</span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${record.timeOut ? 'bg-amber-400' : 'bg-neutral-300'}`} />
                        Keluar:&nbsp;
                        <span className={`font-semibold tabular-nums ${record.timeOut ? 'text-neutral-700' : 'text-neutral-400'}`}>
                          {record.timeOut ?? '—'}
                        </span>
                      </span>
                    </div>
                  ) : record.status === 'Izin' || record.status === 'Sakit' ? (
                    <p className="text-xs text-neutral-500 italic truncate">
                      {record.notes ? `Alasan: ${record.notes}` : `Mengajukan ${record.status}`}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-400">Tanpa keterangan</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
