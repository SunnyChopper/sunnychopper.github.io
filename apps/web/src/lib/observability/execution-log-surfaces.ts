/** Shared surface tokens for Observability Execution log UI. */

import { cn } from '@/lib/utils';
import {
  obsFailedRowAccentClassName,
  obsMutedBarClassName,
  obsPanelPaddedClassName,
  obsStatusBadgeClassName,
  obsSucceededRowAccentClassName,
  obsTableContainerClassName,
  obsTableHeadClassName,
  obsTableMinWidthClassName,
} from '@/lib/observability/observability-surfaces';

export const executionLogFiltersPanelClassName = cn(
  obsPanelPaddedClassName,
  'min-w-0 overflow-hidden'
);

export const executionLogFiltersPrimaryGridClassName =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5';

export const executionLogFiltersAdvancedGridClassName =
  'grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3';

export const executionLogFilterLabelClassName =
  'text-xs font-medium text-gray-500 dark:text-gray-400 flex flex-col gap-1 min-w-0';

export const executionLogTableContainerClassName = cn(
  obsTableContainerClassName,
  'max-h-[min(70vh,560px)]'
);

export const executionLogTableClassName = obsTableMinWidthClassName;

export const executionLogTableHeadClassName = cn(
  obsTableHeadClassName,
  'sticky top-0 bg-white dark:bg-gray-900 z-10'
);

export const executionLogPreviewPanelClassName =
  'pointer-events-none absolute left-0 top-full z-30 mt-1 hidden w-max max-w-md rounded-lg border border-gray-200/80 bg-white p-3 text-xs text-gray-700 shadow-lg dark:border-gray-600/70 dark:bg-gray-900/90 dark:text-gray-200 group-hover/preview:block group-focus-within/preview:block whitespace-pre-wrap break-words max-h-48 overflow-y-auto';

export const executionLogPaginationBarClassName = cn(
  obsMutedBarClassName,
  'flex flex-wrap items-center justify-between gap-3'
);

export function executionLogRowClassName(status: string, isSelected: boolean): string {
  const base =
    'border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-inset';

  const selected = isSelected
    ? 'bg-violet-50/90 dark:bg-violet-950/35 ring-1 ring-inset ring-violet-300/60 dark:ring-violet-700/50'
    : '';

  if (status === 'failed') {
    return cn(
      base,
      selected,
      obsFailedRowAccentClassName,
      'bg-red-50/50 dark:bg-red-950/25 hover:bg-red-50/70 dark:hover:bg-red-950/40'
    );
  }

  if (status === 'succeeded') {
    return cn(
      base,
      selected,
      obsSucceededRowAccentClassName,
      'hover:bg-gray-50 dark:hover:bg-gray-800/80'
    );
  }

  return cn(base, selected, 'hover:bg-gray-50 dark:hover:bg-gray-800/80');
}

export function executionLogStatusBadgeClassName(status: string): string {
  return obsStatusBadgeClassName(status);
}
