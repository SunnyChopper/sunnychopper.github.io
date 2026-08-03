import Skeleton from '@/components/atoms/Skeleton';
import type { AIProjectToolMode } from '@/lib/projects/ai-project-tools-surfaces';
import { cn } from '@/lib/utils';

const HEALTH_FACTOR_COUNT = 6;
const GENERATE_TASK_COUNT = 4;
const RISK_CARD_COUNT = 4;

function HealthFactorSkeletonRow() {
  return (
    <div
      className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60"
      data-testid="health-factor-skeleton"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Skeleton className="h-4 w-40" variant="text" />
        <Skeleton className="h-3 w-28" variant="text" />
      </div>
      <Skeleton className="mt-2 h-4 w-full" variant="text" />
      <Skeleton className="mt-1 h-4 w-5/6" variant="text" />
    </div>
  );
}

function HealthLoadingSkeleton() {
  return (
    <div className="mt-4 space-y-4" data-testid="ai-project-assist-skeleton-health">
      <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-24" variant="text" />
            <Skeleton variant="rectangular" className="h-5 w-16 rounded-full" />
            <Skeleton className="h-3 w-28" variant="text" />
          </div>
          <Skeleton className="h-9 w-16" variant="text" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-28" variant="text" />
        {Array.from({ length: HEALTH_FACTOR_COUNT }).map((_, index) => (
          <HealthFactorSkeletonRow key={index} />
        ))}
      </div>
    </div>
  );
}

function GenerateLoadingSkeleton() {
  return (
    <div className="mt-4 space-y-3" data-testid="ai-project-assist-skeleton-generate">
      <div className="rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-700 dark:bg-gray-800">
        <Skeleton className="h-4 w-32" variant="text" />
        <Skeleton className="mt-2 h-4 w-full" variant="text" />
        <Skeleton className="mt-2 h-3 w-48" variant="text" />
        <div className="mt-2 flex flex-wrap gap-2">
          <Skeleton variant="rectangular" className="h-6 w-20 rounded-full" />
          <Skeleton variant="rectangular" className="h-6 w-24 rounded-full" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: GENERATE_TASK_COUNT }).map((_, index) => (
          <div
            key={index}
            className="rounded bg-gray-50 p-2 dark:bg-gray-700"
            data-testid="generate-task-skeleton"
          >
            <Skeleton className="h-4 w-2/3" variant="text" />
            <Skeleton className="mt-2 h-3 w-full" variant="text" />
            <Skeleton className="mt-1 h-3 w-1/2" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskLoadingSkeleton() {
  return (
    <div className="mt-4 space-y-4" data-testid="ai-project-assist-skeleton-risks">
      <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" variant="text" />
          <Skeleton variant="rectangular" className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-3 h-4 w-full" variant="text" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: RISK_CARD_COUNT }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60"
            data-testid="risk-card-skeleton"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Skeleton className="h-4 w-44" variant="text" />
              <Skeleton className="h-3 w-24" variant="text" />
            </div>
            <Skeleton className="mt-2 h-4 w-full" variant="text" />
            <Skeleton className="mt-2 h-3 w-32" variant="text" />
            <Skeleton className="mt-2 h-3 w-full" variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}

export type AIProjectAssistLoadingSkeletonProps = {
  mode: AIProjectToolMode;
  className?: string;
  statusMessage?: string;
};

export function AIProjectAssistLoadingSkeleton({
  mode,
  className,
  statusMessage = 'Analyzing project…',
}: AIProjectAssistLoadingSkeletonProps) {
  return (
    <div
      className={cn('py-1', className)}
      aria-busy="true"
      aria-live="polite"
      data-testid="ai-project-assist-loading-skeleton"
    >
      <span className="sr-only">{statusMessage}</span>
      {mode === 'health' ? <HealthLoadingSkeleton /> : null}
      {mode === 'generate' ? <GenerateLoadingSkeleton /> : null}
      {mode === 'risks' ? <RiskLoadingSkeleton /> : null}
    </div>
  );
}
