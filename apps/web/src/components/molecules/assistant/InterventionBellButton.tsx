import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type InterventionBellButtonProps = {
  unreadCount: number;
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
};

export function InterventionBellButton({
  unreadCount,
  onClick,
  className,
  'aria-label': ariaLabel = 'Open assistant interventions',
}: InterventionBellButtonProps) {
  const showBadge = unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      <Bell size={20} />
      {showBadge ? (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold flex items-center justify-center"
          aria-hidden
        >
          {badgeLabel}
        </span>
      ) : null}
    </button>
  );
}
