import { cn, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import type { AttendanceStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const DOT_COLORS: Record<AttendanceStatus, string> = {
  hadir: 'bg-success-500',
  terlambat: 'bg-warning-500',
  izin: 'bg-primary-500',
  alpha: 'bg-danger-500',
  libur: 'bg-neutral-400',
};

export function StatusBadge({ status, size = 'md', showDot = true }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        getStatusBadgeClass(status),
        size === 'sm' && 'text-[10px] px-2 py-0.5',
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[status])} />}
      {getStatusLabel(status)}
    </span>
  );
}
