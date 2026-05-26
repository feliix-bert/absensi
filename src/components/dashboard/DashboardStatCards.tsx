'use client';

import { CheckCircle2, Flame, Calendar } from 'lucide-react';
import { getRemainingDays } from '@/lib/utils';

const STATS = (remaining: number, stats: any) => [
  {
    icon: CheckCircle2,
    label: 'Hadir',
    value: stats?.attendedDays || 0,
    sub: `dari ${stats?.totalDays || 30} hari`,
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Flame,
    label: 'Streak',
    value: stats?.streakDays || 0,
    sub: 'hari berturut',
    iconBg: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Calendar,
    label: 'Sisa hari magang',
    value: remaining,
    sub: 'hari lagi',
    iconBg: 'bg-primary-50 text-primary-600',
  },
];

interface DashboardStatCardsProps {
  stats: any
  profile: any
}

export function DashboardStatCards({ stats, profile }: DashboardStatCardsProps) {
  // Try to calculate remaining days based on profile's selesai_magang
  const endDate = profile?.selesai_magang ? new Date(profile.selesai_magang) : new Date();
  const remaining = getRemainingDays(endDate.toISOString());

  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS(remaining, stats).map((s) => (
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
