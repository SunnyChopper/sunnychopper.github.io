import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusPillClassName } from '@/pages/admin/personal-branding/personal-branding-ui';

export interface PlatformDefaultAppliedNoticeProps {
  className?: string;
  onDismiss: () => void;
}

export default function PlatformDefaultAppliedNotice({
  className,
  onDismiss,
}: PlatformDefaultAppliedNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 rounded-md border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 dark:border-blue-900/50 dark:bg-blue-950/25',
        className
      )}
      role="status"
      aria-label="Platform default applied"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={statusPillClassName('info')}>Platform default applied</span>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Character and read-time limits were filled from the selected platform. You can override
          them anytime.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-blue-100 hover:text-gray-700 dark:hover:bg-blue-900/40 dark:hover:text-gray-200"
        aria-label="Dismiss platform default notice"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
