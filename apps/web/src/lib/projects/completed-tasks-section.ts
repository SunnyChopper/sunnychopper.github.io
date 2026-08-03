import { formatTaskStoryPointsLabel } from '@/constants/growth-system';
import type { Task } from '@/types/growth-system';
import { formatDateString } from '@/utils/date-formatters';

/** When completed count exceeds this value, the section defaults to collapsed. */
export const COMPLETED_SECTION_AUTO_COLLAPSE_AFTER = 3;

export function shouldAutoCollapseCompletedSection(completedCount: number): boolean {
  return completedCount > COMPLETED_SECTION_AUTO_COLLAPSE_AFTER;
}

export type CompletedSummaryTask = Pick<Task, 'title' | 'completedDate' | 'size'>;

/**
 * One-line summary for the most recent completed task (collapsed section).
 * Format: `title · {pts} · {date}` with middle segments omitted when absent.
 */
export function formatMostRecentCompletedSummary(task: CompletedSummaryTask): string {
  const parts: string[] = [task.title];

  if (task.size != null && task.size > 0) {
    parts.push(formatTaskStoryPointsLabel(task.size));
  }

  const completedDate = formatDateString(task.completedDate);
  if (completedDate) {
    parts.push(completedDate);
  }

  return parts.join(' · ');
}
