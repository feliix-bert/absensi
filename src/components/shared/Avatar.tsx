import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: 'w-8 h-8 text-xs rounded-full',
  md: 'w-10 h-10 text-sm rounded-full',
  lg: 'w-12 h-12 text-sm rounded-xl',
  xl: 'w-20 h-20 text-2xl rounded-2xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(SIZES[size], 'object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        SIZES[size],
        'bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0',
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
