import { Skeleton } from '@/components/shared/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Greeting Skeleton */}
          <section className="card-modern p-5 md:p-6 flex items-center justify-between gap-4 border-l-4 border-l-primary-200">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-200 rounded w-24"></div>
              <div className="h-6 bg-neutral-200 rounded w-32"></div>
              <div className="h-4 bg-neutral-200 rounded w-40"></div>
              <div className="h-5 bg-neutral-200 rounded-full w-20 mt-3"></div>
            </div>
            <div className="w-16 h-16 rounded-full bg-neutral-200 shrink-0"></div>
          </section>

          {/* Today Action Skeleton */}
          <div className="card-modern p-5 space-y-4">
            <div className="h-5 bg-neutral-200 rounded w-48"></div>
            <div className="flex gap-3">
              <div className="h-12 bg-neutral-200 rounded-xl flex-1"></div>
              <div className="h-12 bg-neutral-200 rounded-xl flex-1"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-modern p-4 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-200"></div>
                <div className="space-y-1">
                  <div className="h-7 bg-neutral-200 rounded w-12"></div>
                  <div className="h-3 bg-neutral-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Skeleton */}
          <div className="card-modern p-5 space-y-4">
            <div className="h-5 bg-neutral-200 rounded w-32"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded bg-neutral-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-full"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-5">
          {/* Profile Summary Skeleton */}
          <aside className="hidden lg:block card-modern p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-200"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-2 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-10 bg-neutral-200 rounded-xl w-full mt-4"></div>
          </aside>

          {/* Reminders Skeleton */}
          <div className="card-modern p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-neutral-200 rounded w-32"></div>
              <div className="h-4 bg-neutral-200 rounded-full w-6"></div>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-full"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-10 bg-neutral-200 rounded-xl w-full mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
