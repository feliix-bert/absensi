'use client';

import { MOCK_USER, MOCK_STATS } from '@/lib/mock-data';
import { getInternshipProgress } from '@/lib/utils';

export function DashboardProgress() {
  const progress = getInternshipProgress(MOCK_USER.startDate, MOCK_USER.endDate);
  const start = new Date(MOCK_USER.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const end = new Date(MOCK_USER.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  return (
    <div className="card-modern p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-800">Progress Magang</h2>
            <span className="text-sm font-bold text-primary-600 tabular-nums">{progress}%</span>
          </div>
          <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-neutral-400">
            <span>{start}</span>
            <span>{end}</span>
          </div>
        </div>

        <div className="sm:w-48 shrink-0 pt-1 sm:pt-0 sm:border-l sm:border-neutral-100 sm:pl-6">
          <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1">
            Tingkat kehadiran
          </p>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums">{MOCK_STATS.attendanceRate}%</p>
          <div className="flex gap-4 mt-3 text-center">
            {[
              { l: 'Hadir', v: MOCK_STATS.attendedDays, c: 'text-emerald-600' },
              { l: 'Izin', v: MOCK_STATS.izinDays, c: 'text-primary-600' },
              { l: 'Alpha', v: MOCK_STATS.alphaDays, c: 'text-red-500' },
            ].map((x) => (
              <div key={x.l}>
                <p className={`text-sm font-bold ${x.c}`}>{x.v}</p>
                <p className="text-[10px] text-neutral-400">{x.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
