'use client';

import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { DashboardToday } from '@/components/dashboard/DashboardToday';
import { DashboardStatCards } from '@/components/dashboard/DashboardStatCards';
import { DashboardProgress } from '@/components/dashboard/DashboardProgress';
import { DashboardActivity } from '@/components/dashboard/DashboardActivity';
import { ProfileSummary } from '@/components/dashboard/ProfileSummary';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        <div className="lg:col-span-2 space-y-5">
          <DashboardGreeting />
          <DashboardToday />
          <DashboardStatCards />
          <DashboardProgress />
          <DashboardActivity />
        </div>
        <ProfileSummary />
      </div>
    </div>
  );
}
