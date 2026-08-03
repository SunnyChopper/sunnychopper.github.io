import Skeleton from '@/components/atoms/Skeleton';
import { weeklyStatTileShellClassName } from '@/lib/growth-system/weekly-stat-tile-surfaces';
import { cn } from '@/lib/utils';

const STAT_TILE_COUNT = 5;
const INSIGHT_CARD_COUNT = 3;

const weekSummaryShellClassName =
  'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-none';

const velocityChartShellClassName =
  'rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-900/60';

const insightCardShellClassName =
  'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/90';

function StatTileSkeleton() {
  return (
    <div
      className={weeklyStatTileShellClassName({ isZero: false, historicalMuted: false })}
      data-testid="weekly-review-stat-tile-skeleton"
      aria-hidden
    >
      <Skeleton className="h-5 w-5" variant="rectangular" />
      <Skeleton className="mt-2 h-8 w-12" variant="text" />
      <Skeleton className="mt-1 h-3 w-16" variant="text" />
    </div>
  );
}

function VelocityChartSkeleton() {
  return (
    <div
      className={cn(velocityChartShellClassName, 'mt-4')}
      data-testid="weekly-review-velocity-chart-skeleton"
      aria-hidden
    >
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <Skeleton className="h-4 w-36" variant="text" />
        <Skeleton className="h-3 w-44" variant="text" />
      </div>
      <Skeleton className="mx-auto h-[140px] w-full max-w-md" variant="rectangular" />
      <Skeleton className="mx-auto mt-2 h-3 w-48" variant="text" />
    </div>
  );
}

function InsightCardSkeleton() {
  return (
    <div
      className={insightCardShellClassName}
      data-testid="weekly-review-insight-card-skeleton"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2 dark:border-gray-700/80">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-4 w-4 shrink-0" variant="rectangular" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
        <Skeleton className="h-3 w-10" variant="text" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" variant="text" />
      <Skeleton className="mt-2 h-4 w-5/6" variant="text" />
      <Skeleton className="mt-1 h-4 w-2/3" variant="text" />
    </div>
  );
}

function WowNarrativeSkeleton() {
  return (
    <div
      className="mb-5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40"
      data-testid="weekly-review-wow-narrative-skeleton"
      aria-hidden
    >
      <Skeleton className="h-3 w-24" variant="text" />
      <Skeleton className="mt-3 h-4 w-full" variant="text" />
      <Skeleton className="mt-2 h-4 w-11/12" variant="text" />
    </div>
  );
}

/** Geometry-matched loading placeholder for Weekly Review week-switch loads. */
export function WeeklyReviewWeekSwitchSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('space-y-6', className)}
      data-testid="weekly-review-week-switch-skeleton"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading weekly review…</span>

      <div className={weekSummaryShellClassName} aria-hidden>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5" variant="rectangular" />
          <Skeleton className="h-5 w-32" variant="text" />
        </div>
        <div className="mb-2 grid grid-cols-2 gap-3 md:grid-cols-5">
          {Array.from({ length: STAT_TILE_COUNT }).map((_, index) => (
            <StatTileSkeleton key={index} />
          ))}
        </div>
        <VelocityChartSkeleton />
      </div>

      <div className={weekSummaryShellClassName} aria-hidden>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-5 w-5" variant="rectangular" />
          <Skeleton className="h-5 w-28" variant="text" />
        </div>
        <WowNarrativeSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: INSIGHT_CARD_COUNT }).map((_, index) => (
            <InsightCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
