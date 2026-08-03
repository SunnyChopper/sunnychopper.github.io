import {
  obsKpiLabelClassName,
  obsMutedBarClassName,
} from '@/lib/observability/observability-surfaces';

export const portfolioHealthStripClassName = `${obsMutedBarClassName} flex flex-wrap items-end gap-x-6 gap-y-3`;

export const portfolioHealthMetricLabelClassName = obsKpiLabelClassName;

export const portfolioHealthMetricValueClassName =
  'text-sm font-semibold tabular-nums text-gray-900 dark:text-white';

export const portfolioHealthScoreValueClassName = (score: number | null): string => {
  if (score === null) {
    return 'text-sm font-semibold tabular-nums text-gray-500 dark:text-gray-400';
  }
  if (score >= 70) return 'text-sm font-semibold tabular-nums text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400';
  return 'text-sm font-semibold tabular-nums text-red-600 dark:text-red-400';
};

export const portfolioHealthOverdueValueClassName =
  'text-sm font-semibold tabular-nums text-red-700 dark:text-red-400';

export const portfolioHealthStaleValueClassName =
  'text-sm font-semibold tabular-nums text-amber-700 dark:text-amber-400';
