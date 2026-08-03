import { formatTaskStoryPointsLabel } from '@/constants/growth-system';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
};

export interface StoryPointsBadgeProps {
  size: number | null | undefined;
  className?: string;
}

/** Fibonacci story-point estimate chip for kanban and list surfaces. */
export function StoryPointsBadge({ size, className }: StoryPointsBadgeProps) {
  if (size == null || size <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        sizeClasses.sm,
        className
      )}
      title="Story points (Fibonacci)"
    >
      {formatTaskStoryPointsLabel(size)}
    </span>
  );
}
