/** Shared surface tokens for Observability Execution detail modal. */

import {
  obsPanelClassName,
  obsStatusBadgeClassName,
} from '@/lib/observability/observability-surfaces';

export const executionDetailStickyHeaderClassName =
  'sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200/80 bg-white/95 px-6 py-3 backdrop-blur-sm dark:border-gray-700/70 dark:bg-gray-900/95';

export const executionDetailTextPanelClassName =
  'min-w-0 overflow-x-hidden overflow-y-auto rounded-md border border-gray-200/80 bg-gray-50/90 p-3 text-xs text-gray-800 dark:border-gray-700/70 dark:bg-gray-900/50 dark:text-gray-200';

export const executionDetailPreClassName =
  'whitespace-pre-wrap break-words font-mono text-xs text-gray-800 dark:text-gray-200';

export const executionDetailMetricGridClassName =
  'grid grid-cols-1 gap-2 sm:grid-cols-3 sm:items-stretch';

export const executionDetailMetricTileClassName =
  'flex min-h-[4.5rem] flex-col justify-between rounded-md border border-gray-200/80 bg-white/90 px-2.5 py-2 dark:border-gray-700/70 dark:bg-gray-900/60';

export const executionDetailMetricLabelClassName =
  'text-[10px] font-medium uppercase tracking-wide text-gray-500';

export const executionDetailMetricValueClassName =
  'mt-0.5 text-xs font-medium tabular-nums text-gray-900 dark:text-gray-100';

export const executionDetailMetricSubRowClassName =
  'block text-[11px] text-gray-500 dark:text-gray-400';

export const executionDetailRawPayloadPanelClassName =
  'max-h-96 min-w-0 overflow-auto rounded-md border border-gray-200/80 bg-gray-50/90 p-3 dark:border-gray-700/70 dark:bg-gray-900/50';

export const executionDetailPromptRoleClassName =
  'text-xs font-semibold capitalize text-violet-600 dark:text-violet-400';

export const executionDetailSectionStackClassName = 'space-y-3';

export const executionDetailLoadingPanelClassName = `${obsPanelClassName} p-6`;

export function executionDetailStatusBadgeClassName(status: string): string {
  return obsStatusBadgeClassName(status);
}
