'use client';

import { CheckCircle2, Flame, Calendar } from 'lucide-react';
import { MOCK_STATS } from '@/lib/mock-data';
import { getRemainingDays } from '@/lib/utils';
import { MOCK_USER } from '@/lib/mock-data';

const STATS = (remaining: number) => [
  {
    icon: CheckCircle2,
    label: 'Hadir',
    value: MOCK_STATS.attendedDays,
    sub: `dari ${MOCK_STATS.totalDays} hari`,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Flame,
    label: 'Streak',
    value: MOCK_STATS.streakDays,
    sub: 'hari berturut',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Calendar,
    label: 'Sisa magang',
    value: remaining,
    sub: 'hari lagi',
    iconBg: 'bg-primary-50 text-primary-600',
  },
];

export function DashboardStatCards() {
  const remaining = getRemainingDays(MOCK_USER.endDate);

  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS(remaining).map((s) => (
        <div key={s.label} className="card-modern p-4">
          <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
            <s.icon size={18} />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tabular-nums leading-none">{s.value}</p>
          <p className="text-xs font-semibold text-neutral-700 mt-1">{s.label}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
