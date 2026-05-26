'use client';

import Link from 'next/link';
import { ChevronRight, CalendarX } from 'lucide-react';

import { StatusBadge } from '@/components/shared/StatusBadge';

interface ActivityRecord {
  id: string;
  check_in: string;
  status: string;
  time: string;
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
            // Use check_in for date, formatted in WIB timezone
            const dateObj = new Date(record.check_in);
            const dayNum = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              timeZone: 'Asia/Jakarta',
            });
            const monthStr = dateObj.toLocaleDateString('id-ID', {
              month: 'short',
              timeZone: 'Asia/Jakarta',
            });

            return (
              <div key={record.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50/80 transition-colors">
                <div className="w-11 text-center shrink-0">
                  <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                    {monthStr}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 leading-tight tabular-nums">
                    {dayNum}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={record.status} size="sm" />
                    {record.isLate && (
                      <span className="text-[10px] font-medium text-amber-600">Terlambat</span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5 truncate">
                    {record.time ? record.time : '—'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

