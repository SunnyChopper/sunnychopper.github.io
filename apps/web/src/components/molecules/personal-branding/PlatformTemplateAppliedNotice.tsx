import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusPillClassName } from '@/pages/admin/personal-branding/personal-branding-ui';

export interface PlatformTemplateAppliedNoticeProps {
  className?: string;
  onDismiss: () => void;
}

export default function PlatformTemplateAppliedNotice({
  className,
  onDismiss,
}: PlatformTemplateAppliedNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50/70 px-2.5 py-1.5 dark:border-emerald-900/50 dark:bg-emerald-950/25',
        className
      )}
      role="status"
      aria-label="Template applied"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={statusPillClassName('success')}>Template applied</span>
        <p className="text-xs text-gray-700 dark:text-gray-300">
          Template applied — edit anything before saving.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 text-gray-500 hover:bg-emerald-100 hover:text-gray-700 dark:hover:bg-emerald-900/40 dark:hover:text-gray-200"
        aria-label="Dismiss template applied notice"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
