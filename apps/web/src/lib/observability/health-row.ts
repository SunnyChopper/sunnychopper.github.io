import type { ObservabilityHealthRow } from '@/types/observability';
import { formatObservabilityDateTime } from '@/lib/observability-formatters';
import {
  obsFailedRowAccentClassName,
  obsIsFailedStatus,
  obsKpiLabelClassName,
  obsMutedBarClassName,
} from '@/lib/observability/observability-surfaces';

/** Shared surface tokens for Automation Health UI. */

export const healthSummaryStripClassName = obsMutedBarClassName;

export const healthSummaryMetricLabelClassName = obsKpiLabelClassName;

export const healthSummaryMetricValueClassName =
  'text-sm font-semibold tabular-nums text-gray-900 dark:text-white';

export const healthSummaryMetricValueDangerClassName =
  'text-sm font-semibold tabular-nums text-red-700 dark:text-red-400';

export const healthFailedRowAccentClassName = obsFailedRowAccentClassName;

export const healthFailureTimeFailedClassName =
  'text-xs font-medium tabular-nums whitespace-nowrap text-red-700 dark:text-red-400';

export const healthFailureTimeMutedClassName =
  'text-xs tabular-nums whitespace-nowrap text-gray-500 dark:text-gray-400';

export const healthErrorPanelClassName =
  'rounded-lg border border-gray-200/80 bg-gray-50/90 dark:border-gray-700/70 dark:bg-gray-900/50';

export const healthErrorPanelScrollClassName =
  'max-h-48 overflow-auto font-mono text-xs text-gray-700 dark:text-gray-300';

export function isFailedHealthStatus(status: string): boolean {
  return obsIsFailedStatus(status);
}

/** Timestamp used for the Last failure column (finished time preferred). */
export function healthRowFailureAt(row: ObservabilityHealthRow): string {
  return row.lastFinishedAt ?? row.lastStartedAt;
}

export function formatHealthFailureAt(iso: string): string {
  return formatObservabilityDateTime(iso);
}

export function formatHealthSummaryFailureAt(iso: string | null | undefined): string {
  if (!iso) return '—';
  return formatHealthFailureAt(iso);
}

/** Combined error payload for clipboard copy. */
export function buildHealthErrorCopyText(
  errorMessage?: string | null,
  stackTrace?: string | null
): string {
  const parts: string[] = [];
  if (errorMessage?.trim()) parts.push(errorMessage.trim());
  if (stackTrace?.trim()) parts.push(stackTrace.trim());
  return parts.join('\n\n');
}
