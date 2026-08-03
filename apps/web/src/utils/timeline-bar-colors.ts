import type { GoalStatus, ProjectStatus } from '@/types/growth-system';
import {
  PROJECT_STATUS_TIMELINE_LEGEND_CORE,
  getProjectStatusTimelineBarClasses,
} from '@/lib/growth-system/project-status-surfaces';

/** Tailwind gradient + border classes for timeline bar fills. */
export type TimelineBarColorClasses = string;

const ON_HOLD_BAR: TimelineBarColorClasses =
  'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 border-yellow-600 dark:border-yellow-500';

const CANCELLED_BAR: TimelineBarColorClasses =
  'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 border-gray-600 dark:border-gray-500';

const GOAL_PLANNING_BAR: TimelineBarColorClasses =
  'from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-600 border-slate-500 dark:border-slate-400';

const ACHIEVED_BAR: TimelineBarColorClasses =
  'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-purple-600 dark:border-purple-500';

const ARCHIVED_BAR: TimelineBarColorClasses =
  'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 border-gray-600 dark:border-gray-500';

export function getProjectTimelineBarColorClasses(
  status: ProjectStatus,
  options?: { isWorkComplete?: boolean; isStale?: boolean }
): TimelineBarColorClasses {
  if (options?.isStale) return getProjectStatusTimelineBarClasses('Stale');
  if (status === 'Archived') return ARCHIVED_BAR;
  if (status === 'Cancelled') return CANCELLED_BAR;
  if (status === 'Completed' || options?.isWorkComplete) {
    return getProjectStatusTimelineBarClasses('Completed');
  }
  if (status === 'On Hold') return ON_HOLD_BAR;
  if (status === 'Planning') return getProjectStatusTimelineBarClasses('Planning');
  return getProjectStatusTimelineBarClasses('Active');
}

export function getGoalTimelineBarColorClasses(status: GoalStatus): TimelineBarColorClasses {
  switch (status) {
    case 'Planning':
      return GOAL_PLANNING_BAR;
    case 'Achieved':
      return ACHIEVED_BAR;
    case 'Abandoned':
      return CANCELLED_BAR;
    case 'Active':
    default:
      return getProjectStatusTimelineBarClasses('Active');
  }
}

/** Legend swatch colors aligned with timeline bar fills. */
export const PROJECT_TIMELINE_LEGEND = [
  ...PROJECT_STATUS_TIMELINE_LEGEND_CORE,
  { label: 'On Hold', swatchClass: 'bg-yellow-500' },
  { label: 'Cancelled', swatchClass: 'bg-gray-500' },
  { label: 'Archived', swatchClass: 'bg-gray-500' },
] as const;

export const GOAL_TIMELINE_LEGEND = [
  { label: 'Planning', swatchClass: 'bg-slate-400' },
  { label: 'Active', swatchClass: 'bg-blue-500' },
  { label: 'Achieved', swatchClass: 'bg-purple-500' },
  { label: 'Abandoned', swatchClass: 'bg-gray-500' },
] as const;
