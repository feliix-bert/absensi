'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MOCK_ATTENDANCE_HISTORY } from '@/lib/mock-data';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function DashboardActivity() {
  const items = MOCK_ATTENDANCE_HISTORY.slice(0, 5);

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
        {items.map((record) => {
          const d = new Date(record.date);
          return (
            <div key={record.id} className="flex items-center gap-4 p-4 hover:bg-neutral-50/80 transition-colors">
              <div className="w-11 text-center shrink-0">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase">
                  {d.toLocaleDateString('id-ID', { month: 'short' })}
                </p>
                <p className="text-lg font-bold text-neutral-900 leading-tight tabular-nums">
                  {d.getDate()}
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
                  {record.checkIn
                    ? `${record.checkIn} – ${record.checkOut ?? 'belum keluar'}`
                    : record.notes ?? '—'}
                </p>
              </div>
              {record.duration && (
                <span className="text-xs font-medium text-neutral-400 shrink-0 tabular-nums">
                  {record.duration}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
