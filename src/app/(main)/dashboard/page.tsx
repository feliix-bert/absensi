
import { DashboardGreeting } from '@/components/dashboard/DashboardGreeting';
import { DashboardToday } from '@/components/dashboard/DashboardToday';
import { DashboardStatCards } from '@/components/dashboard/DashboardStatCards';
import { DashboardProgress } from '@/components/dashboard/DashboardProgress';
import { DashboardActivity } from '@/components/dashboard/DashboardActivity';
import { ProfileSummary } from '@/components/dashboard/ProfileSummary';
import { DashboardReminders } from '@/components/dashboard/DashboardReminders';
import { getReminders } from '@/actions/reminders.actions';
import { getDashboardStats } from '@/actions/dashboard.actions';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const data = await getDashboardStats();
  const reminders = await getReminders();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*, offices(*)').eq('id', user?.id).single();

  const today = data?.today || {};
  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        <div className="lg:col-span-2 space-y-5">
          <DashboardGreeting />
          <DashboardToday today={today} profile={profile} />
          <DashboardStatCards stats={stats} profile={profile} />
          <DashboardProgress stats={stats} profile={profile} />
          <DashboardActivity recentActivity={recentActivity} />
        </div>
        <div className="space-y-5">
          <ProfileSummary />
          <DashboardReminders initialReminders={reminders} />
        </div>
      </div>
    </div>
  );
}
