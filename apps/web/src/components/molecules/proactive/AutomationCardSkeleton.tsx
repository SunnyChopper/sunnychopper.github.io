import { motion, useReducedMotion } from 'framer-motion';
import { cardSurfaceClassName } from '@/components/atoms/Card';
import Skeleton from '@/components/atoms/Skeleton';
import { cn } from '@/lib/utils';

export type AutomationCardSkeletonProps = {
  count?: number;
  className?: string;
};

function AutomationCardSkeletonItem({
  index,
  reduceMotion,
}: {
  index: number;
  reduceMotion: boolean;
}) {
  const content = (
    <div
      className={cn(
        cardSurfaceClassName,
        'flex h-full min-h-0 flex-col overflow-hidden border-l-4 border-l-gray-200 dark:border-l-gray-700'
      )}
    >
      <div className="flex min-h-0 flex-1 gap-2.5 p-3">
        <Skeleton variant="rectangular" className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
              <Skeleton variant="rectangular" className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto flex shrink-0 flex-wrap items-center gap-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
        <Skeleton variant="rectangular" className="h-9 w-20" />
        <Skeleton variant="rectangular" className="h-9 w-16" />
        <Skeleton variant="rectangular" className="h-9 w-14" />
        <Skeleton variant="rectangular" className="ml-auto h-9 w-14" />
      </div>
    </div>
  );

  if (reduceMotion) {
    return <li className="min-h-0">{content}</li>;
  }

  return (
    <motion.li
      className="min-h-0"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {content}
    </motion.li>
  );
}

export default function AutomationCardSkeleton({
  count = 4,
  className,
}: AutomationCardSkeletonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <ul
      className={cn('grid items-stretch gap-3 sm:grid-cols-1 lg:grid-cols-2', className)}
      aria-busy="true"
      aria-label="Loading automations"
    >
      {Array.from({ length: count }).map((_, index) => (
        <AutomationCardSkeletonItem
          key={index}
          index={index}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </ul>
  );
}
