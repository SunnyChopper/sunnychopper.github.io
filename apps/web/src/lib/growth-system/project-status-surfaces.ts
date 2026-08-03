/**
 * Single source of truth for Projects status hues (Active / Planning / Stale / Completed).
 * Badge text/bg tokens and timeline bar/legend swatches must stay aligned here.
 */

export type ProjectStatusHueKey = 'Planning' | 'Active' | 'Stale' | 'Completed';

export interface ProjectStatusBadgeColors {
  bg: string;
  text: string;
}

export interface ProjectStatusTimelineTokens {
  barClasses: string;
  legendSwatchClass: string;
}

const PLANNING_BADGE: ProjectStatusBadgeColors = {
  bg: 'bg-purple-100 dark:bg-purple-900/30',
  text: 'text-purple-700 dark:text-purple-400',
};

const ACTIVE_BADGE: ProjectStatusBadgeColors = {
  bg: 'bg-blue-100 dark:bg-blue-900/30',
  text: 'text-blue-700 dark:text-blue-400',
};

const STALE_BADGE: ProjectStatusBadgeColors = {
  bg: 'bg-rose-100 dark:bg-rose-900/30',
  text: 'text-rose-700 dark:text-rose-400',
};

const COMPLETED_BADGE: ProjectStatusBadgeColors = {
  bg: 'bg-green-100 dark:bg-green-900/30',
  text: 'text-green-700 dark:text-green-400',
};

const PLANNING_TIMELINE: ProjectStatusTimelineTokens = {
  barClasses:
    'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-purple-600 dark:border-purple-500',
  legendSwatchClass: 'bg-purple-500',
};

const ACTIVE_TIMELINE: ProjectStatusTimelineTokens = {
  barClasses:
    'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-600 dark:border-blue-500',
  legendSwatchClass: 'bg-blue-500',
};

const STALE_TIMELINE: ProjectStatusTimelineTokens = {
  barClasses:
    'from-rose-500/90 to-rose-600/90 dark:from-rose-600/90 dark:to-rose-700/90 border-rose-600 dark:border-rose-500 border-dashed',
  legendSwatchClass: 'bg-rose-500',
};

const COMPLETED_TIMELINE: ProjectStatusTimelineTokens = {
  barClasses:
    'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 border-green-600 dark:border-green-500',
  legendSwatchClass: 'bg-green-500',
};

export const PROJECT_STATUS_BADGE_COLORS: Record<ProjectStatusHueKey, ProjectStatusBadgeColors> = {
  Planning: PLANNING_BADGE,
  Active: ACTIVE_BADGE,
  Stale: STALE_BADGE,
  Completed: COMPLETED_BADGE,
};

export const PROJECT_STATUS_TIMELINE_TOKENS: Record<
  ProjectStatusHueKey,
  ProjectStatusTimelineTokens
> = {
  Planning: PLANNING_TIMELINE,
  Active: ACTIVE_TIMELINE,
  Stale: STALE_TIMELINE,
  Completed: COMPLETED_TIMELINE,
};

/** Core four statuses for timeline legend (subset of full project status enum). */
export const PROJECT_STATUS_TIMELINE_LEGEND_CORE = [
  { label: 'Planning', swatchClass: PLANNING_TIMELINE.legendSwatchClass },
  { label: 'Active', swatchClass: ACTIVE_TIMELINE.legendSwatchClass },
  { label: 'Stale', swatchClass: STALE_TIMELINE.legendSwatchClass },
  { label: 'Completed', swatchClass: COMPLETED_TIMELINE.legendSwatchClass },
] as const;

export function getProjectStatusBadgeColors(status: string): ProjectStatusBadgeColors | undefined {
  if (status in PROJECT_STATUS_BADGE_COLORS) {
    return PROJECT_STATUS_BADGE_COLORS[status as ProjectStatusHueKey];
  }
  return undefined;
}

export function getProjectStatusTimelineBarClasses(status: ProjectStatusHueKey): string {
  return PROJECT_STATUS_TIMELINE_TOKENS[status].barClasses;
}
