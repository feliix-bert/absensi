import { cn } from '@/lib/utils';
import { ClipboardX, CalendarX, MapPinOff, BellOff } from 'lucide-react';

type EmptyVariant = 'attendance' | 'history' | 'notifications' | 'generic';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const VARIANTS = {
  attendance: { icon: ClipboardX, title: 'No attendance yet', description: 'You haven\'t recorded attendance today.' },
  history: { icon: CalendarX, title: 'No history yet', description: 'Your attendance history will appear here.' },
  notifications: { icon: BellOff, title: 'No notifications', description: 'All notifications have been read.' },
  generic: { icon: MapPinOff, title: 'No data', description: 'Data is currently unavailable.' },
};

export function EmptyState({ variant = 'generic', title, description, action, className }: EmptyStateProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-neutral-400" />
      </div>
      <h3 className="text-heading-md text-neutral-700 mb-1">{title ?? config.title}</h3>
      <p className="text-body-md text-neutral-400 max-w-xs">{description ?? config.description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
