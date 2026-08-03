import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  categoryHeaderClassName,
  writeCountBadgeClassName,
} from '@/lib/settings/assistant-tool-approval-ui';

export type ToolApprovalCategoryHeaderProps = {
  category: string;
  approvedCount: number;
  totalCount: number;
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
  reduceMotion?: boolean;
};

export function ToolApprovalCategoryHeader({
  category,
  approvedCount,
  totalCount,
  isOpen,
  panelId,
  onToggle,
  reduceMotion = false,
}: ToolApprovalCategoryHeaderProps) {
  const hasApproved = approvedCount > 0;
  const writeLabel = totalCount === 1 ? 'write' : 'writes';

  return (
    <button
      type="button"
      onClick={onToggle}
      className={categoryHeaderClassName(hasApproved)}
      aria-expanded={isOpen}
      aria-controls={panelId}
    >
      <ChevronRight
        size={18}
        className={cn(
          'shrink-0 text-gray-500',
          !reduceMotion && 'transition-transform duration-200 ease-out',
          isOpen && 'rotate-90'
        )}
        aria-hidden
      />
      <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-100">
        {category}
      </span>
      <span className={writeCountBadgeClassName(hasApproved)} aria-hidden>
        {approvedCount} / {totalCount} {writeLabel}
      </span>
      <span className="sr-only">
        {approvedCount} of {totalCount} tools require approval in {category}
      </span>
    </button>
  );
}
