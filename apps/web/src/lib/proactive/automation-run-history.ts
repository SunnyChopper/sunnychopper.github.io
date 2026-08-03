import type { ProactiveAutomationRun } from '@/types/api-contracts';

const FAILED_STATUSES = new Set(['failed', 'error', 'failure']);
const SUCCEEDED_STATUSES = new Set(['succeeded', 'success', 'ok']);

export const runHistoryFailedRowAccentClassName = 'border-l-4 border-l-red-500';

export const runHistoryFailedRowClassName =
  'rounded-lg border border-rose-200/80 border-l-4 border-l-red-500 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/25';

export const runHistorySucceededRowSurfaceClassName =
  'rounded-lg border border-gray-200 bg-gray-50/80 dark:border-gray-700 dark:bg-gray-950/40';

export const runHistorySecondaryLinkClassName =
  'inline-flex items-center gap-1 text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline dark:text-gray-400 dark:hover:text-gray-200';

export const runHistoryErrorPanelClassName =
  'rounded-md border border-rose-200/80 bg-white/90 dark:border-rose-900/40 dark:bg-gray-900/60';

export const runHistoryErrorPanelScrollClassName =
  'max-h-48 overflow-y-auto overflow-x-hidden font-mono text-xs text-rose-900 dark:text-rose-100 whitespace-pre-wrap break-words';

export const runHistorySuccessPreviewClassName =
  'mt-2 text-xs text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-wrap break-words';

export function isFailedAutomationRun(status: string): boolean {
  return FAILED_STATUSES.has(status.trim().toLowerCase());
}

export function isSucceededAutomationRun(status: string): boolean {
  return SUCCEEDED_STATUSES.has(status.trim().toLowerCase());
}

/** First failed run id in newest-first list, or null when none failed. */
export function findMostRecentFailedRunId(runs: ProactiveAutomationRun[]): string | null {
  for (const run of runs) {
    if (isFailedAutomationRun(run.status)) {
      return run.id;
    }
  }
  return null;
}
