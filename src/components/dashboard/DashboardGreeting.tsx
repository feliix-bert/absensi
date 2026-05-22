'use client';

import { MOCK_USER } from '@/lib/mock-data';
import { formatDate, getGreeting } from '@/lib/utils';
import { Avatar } from '@/components/shared/Avatar';

export function DashboardGreeting() {
  const today = new Date().toISOString().split('T')[0];
  const firstName = MOCK_USER.name.split(' ')[0];

  return (
    <section className="card-modern p-5 md:p-6 flex items-center justify-between gap-4 border-l-4 border-l-primary-600">
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">{getGreeting()}</p>
        <h1 className="text-xl md:text-2xl font-bold text-neutral-900 mt-0.5 truncate">
          {firstName}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <span className="inline-block mt-3 text-xs font-medium text-secondary-700 bg-secondary-50 px-3 py-1 rounded-full">
          {MOCK_USER.division}
        </span>
      </div>
      <Avatar name={MOCK_USER.name} size="xl" className="ring-4 ring-primary-50 shrink-0" />
    </section>
  );
}
