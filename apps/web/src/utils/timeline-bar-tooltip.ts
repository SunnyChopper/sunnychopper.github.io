import { GOAL_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/constants/growth-system';
import type { GoalStatus, ProjectStatus } from '@/types/growth-system';

/** Human-readable status label aligned with `StatusBadge` label resolution. */
export function formatTimelineBarStatusLabel(status: string): string {
  if (status in PROJECT_STATUS_LABELS) {
    return PROJECT_STATUS_LABELS[status as ProjectStatus];
  }
  if (status in GOAL_STATUS_LABELS) {
    return GOAL_STATUS_LABELS[status as GoalStatus];
  }
  return status;
}

export function formatProjectTimelineBarTooltip(
  name: string,
  badgeStatus: string,
  options?: { progressPercent?: number; showProgress?: boolean }
): string {
  const parts = [name.trim(), formatTimelineBarStatusLabel(badgeStatus)];
  if (options?.showProgress && options.progressPercent != null) {
    parts.push(`${Math.round(options.progressPercent)}%`);
  }
  return parts.join(' · ');
}

export function formatGoalTimelineBarTooltip(title: string, status: string): string {
  return `${title.trim()} · ${formatTimelineBarStatusLabel(status)}`;
}

export function formatProjectTimelineBarAriaLabel(
  name: string,
  badgeStatus: string,
  startLabel: string,
  endLabel: string,
  options?: { progressPercent?: number; showProgress?: boolean }
): string {
  const summary = formatProjectTimelineBarTooltip(name, badgeStatus, options);
  const dateRange = [startLabel, endLabel].filter(Boolean).join(' to ');
  return dateRange ? `Project: ${summary}, ${dateRange}` : `Project: ${summary}`;
}

export function formatGoalTimelineBarAriaLabel(
  title: string,
  status: string,
  startLabel: string,
  endLabel: string
): string {
  const summary = formatGoalTimelineBarTooltip(title, status);
  const dateRange = [startLabel, endLabel].filter(Boolean).join(' to ');
  return dateRange ? `Goal: ${summary}, ${dateRange}` : `Goal: ${summary}`;
}

export const timelineBarTooltipPanelClassName =
  'pointer-events-none absolute left-0 bottom-full z-40 mb-1 hidden w-max max-w-sm rounded-md border border-gray-200/90 bg-white px-2 py-1 text-xs font-medium text-gray-900 shadow-lg dark:border-gray-600/70 dark:bg-gray-900/95 dark:text-gray-100 group-hover/gantt-bar:block group-focus-within/gantt-bar:block whitespace-normal break-words';
