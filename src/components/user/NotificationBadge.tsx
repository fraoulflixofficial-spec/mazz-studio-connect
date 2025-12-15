import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5",
        "bg-gradient-to-br from-red-500 to-red-700",
        "text-white text-xs font-bold rounded-full",
        "flex items-center justify-center",
        "shadow-lg shadow-red-500/40",
        "ring-2 ring-background",
        "animate-pulse-glow",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
