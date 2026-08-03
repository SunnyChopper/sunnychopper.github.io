import type { MouseEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ExplainableEntityType } from '@/lib/entity-explain/types';

const ENTITY_TYPE_LABELS: Record<ExplainableEntityType, string> = {
  task: 'task',
  goal: 'goal',
  project: 'project',
  contentVariant: 'content variant',
};

export interface EntityExplainButtonProps {
  entityType: ExplainableEntityType;
  entityTitle: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** When true, button stays visible (pipeline action rows). */
  alwaysVisible?: boolean;
}

export function EntityExplainButton({
  entityType,
  entityTitle,
  onClick,
  className,
  alwaysVisible = false,
}: EntityExplainButtonProps) {
  const label = ENTITY_TYPE_LABELS[entityType];
  const ariaLabel = `Explain this ${label}: ${entityTitle}`;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      className={cn(
        'flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md p-1.5 transition-opacity',
        'text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-400',
        'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500/60',
        alwaysVisible
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        className
      )}
      title="Explain with Assistant"
      aria-label={ariaLabel}
    >
      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
