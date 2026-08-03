import { motion, useReducedMotion } from 'framer-motion';
import { cardSurfaceClassName } from '@/components/atoms/Card';
import Skeleton from '@/components/atoms/Skeleton';
import { cn } from '@/lib/utils';

export type ProactiveSuggestionCardSkeletonProps = {
  count?: number;
  className?: string;
};

function ProactiveSuggestionCardSkeletonItem({
  index,
  reduceMotion,
}: {
  index: number;
  reduceMotion: boolean;
}) {
  const content = (
    <div className={cn(cardSurfaceClassName, 'flex flex-col overflow-hidden')}>
      <div className="min-w-0 flex-1 p-5">
        <div className="flex flex-wrap items-center gap-2 gap-y-1">
          <Skeleton className="h-5 w-2/3 max-w-xs" />
          <Skeleton variant="rectangular" className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-3 h-3 w-40" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton variant="rectangular" className="h-8 w-full max-w-sm rounded-md" />
          <Skeleton variant="rectangular" className="h-8 w-full max-w-md rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <Skeleton variant="rectangular" className="h-9 w-full rounded-lg sm:w-20" />
        <Skeleton variant="rectangular" className="h-9 w-full rounded-lg sm:w-20" />
        <Skeleton variant="rectangular" className="h-10 w-full rounded-lg sm:w-24" />
      </div>
    </div>
  );

  if (reduceMotion) {
    return <li>{content}</li>;
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      {content}
    </motion.li>
  );
}

export default function ProactiveSuggestionCardSkeleton({
  count = 3,
  className,
}: ProactiveSuggestionCardSkeletonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <ul className={cn('space-y-4', className)} aria-busy="true" aria-label="Loading suggestions">
      {Array.from({ length: count }).map((_, index) => (
        <ProactiveSuggestionCardSkeletonItem
          key={index}
          index={index}
          reduceMotion={Boolean(reduceMotion)}
        />
      ))}
    </ul>
  );
}
