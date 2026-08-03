import type { ProgressRingColor } from '@/components/atoms/ProgressRing';
import type { Goal, Project, ProjectStatus } from '@/types/growth-system';
import { IMPACT_LABELS, SCHEDULE_HEALTH_STYLES } from '@/constants/project-summary';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Progress from linked goal success criteria when present (legacy string criteria supported). */
export const getGoalCriteriaProgressPercent = (goal: Goal): number => {
  const criteria = goal.successCriteria;
  if (!Array.isArray(criteria) || criteria.length === 0) return 0;
  if (typeof criteria[0] === 'string') {
    const completed = (criteria as unknown as string[]).filter((c) => c.includes('✓')).length;
    const total = criteria.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
  const completed = criteria.filter((c) => c.isCompleted).length;
  const total = criteria.length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

/**
 * Project progress (display):
 * - If the project has linked tasks (taskCount > 0), use share of tasks in Done status.
 * - Else if it has linked goals, use the average of each goal’s criteria completion %.
 * - Else 0 (completion still respects explicit project.status === Completed).
 */
export const getProjectProgressPercent = (
  taskCount: number,
  completedTaskCount: number,
  linkedGoals: Goal[]
): number => {
  if (taskCount > 0) {
    return Math.round((Math.min(completedTaskCount, taskCount) / taskCount) * 100);
  }
  if (linkedGoals.length > 0) {
    const sum = linkedGoals.reduce((acc, g) => acc + getGoalCriteriaProgressPercent(g), 0);
    return Math.round(sum / linkedGoals.length);
  }
  return 0;
};

/** Work is “done” for UX (green accent, no overdue, Completed badge) when status says so, all tasks are done, or every linked goal is Achieved. */
export const isProjectWorkComplete = (
  project: Project,
  taskCount: number,
  completedTaskCount: number,
  linkedGoals: Goal[]
): boolean =>
  project.status !== 'Cancelled' &&
  (project.status === 'Completed' ||
    (taskCount > 0 && completedTaskCount >= taskCount) ||
    (linkedGoals.length > 0 && linkedGoals.every((g) => g.status === 'Achieved')));

export const getEffectiveProjectStatus = (
  project: Project,
  workComplete: boolean
): ProjectStatus => {
  if (project.status === 'Cancelled') return 'Cancelled';
  if (project.status === 'Completed' || workComplete) return 'Completed';
  return project.status;
};

/** True when ISO date prefix is strictly before today's UTC calendar date (mirrors backend). */
export const isIsoDateBeforeTodayUtc = (isoDateStr: string, today?: Date): boolean => {
  const target = isoDateStr.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(target)) return false;
  const ref = today ?? new Date();
  const todayStr = ref.toISOString().slice(0, 10);
  return target < todayStr;
};

/** Client mirror of backend `_compute_is_stale` when API omits `isStale`. */
export const computeProjectStaleFromFields = (
  project: Pick<Project, 'status' | 'targetEndDate'>
): boolean => {
  if (project.status !== 'Planning' && project.status !== 'On Hold') return false;
  if (!project.targetEndDate) return false;
  return isIsoDateBeforeTodayUtc(project.targetEndDate);
};

/** True when backend marks the project stale and it is not terminal/complete for display. */
export const isProjectStaleForDisplay = (project: Project, workComplete: boolean): boolean => {
  if (
    workComplete ||
    project.status === 'Completed' ||
    project.status === 'Cancelled' ||
    project.status === 'Archived'
  ) {
    return false;
  }
  if (typeof project.isStale === 'boolean') return project.isStale;
  return computeProjectStaleFromFields(project);
};

export interface ProjectDisplayModel {
  progressPercent: number;
  isWorkComplete: boolean;
  effectiveStatus: ProjectStatus;
  isStale: boolean;
}

/** Badge-facing status for project surfaces (Stale overrides effective status). */
export const getProjectBadgeStatus = (
  effectiveStatus: ProjectStatus | string,
  isStale: boolean
): string => (isStale ? 'Stale' : effectiveStatus);

/** Single resolver for project status badge text across Grid, List, Timeline, detail, graph. */
export const resolveProjectBadgeStatus = (
  project: Project,
  display?: ProjectDisplayModel
): string => {
  const workComplete =
    display?.isWorkComplete ?? (project.status === 'Completed' || project.status === 'Cancelled');
  const effectiveStatus =
    display?.effectiveStatus ?? getEffectiveProjectStatus(project, workComplete);
  const isStale =
    display !== undefined ? display.isStale : isProjectStaleForDisplay(project, workComplete);
  return getProjectBadgeStatus(effectiveStatus, isStale);
};

/** Progress ring stroke color keyed to project display status. */
export const projectProgressRingColor = (status: string): ProgressRingColor => {
  switch (status) {
    case 'Active':
    case 'Completed':
      return 'green';
    case 'Planning':
      return 'amber';
    case 'Stale':
    case 'Cancelled':
      return 'muted';
    default:
      return 'muted';
  }
};

export const getProjectDisplayModel = (
  project: Project,
  taskCount: number,
  completedTaskCount: number,
  linkedGoals: Goal[]
): ProjectDisplayModel => {
  const progressPercent = getProjectProgressPercent(taskCount, completedTaskCount, linkedGoals);
  const isWorkComplete = isProjectWorkComplete(project, taskCount, completedTaskCount, linkedGoals);
  return {
    progressPercent,
    isWorkComplete,
    effectiveStatus: getEffectiveProjectStatus(project, isWorkComplete),
    isStale: isProjectStaleForDisplay(project, isWorkComplete),
  };
};

/** Left accent: emerald when work is complete; otherwise impact colors when impact > 0. */
export const getProjectCardAccentBarClasses = (
  project: Project,
  isWorkComplete: boolean
): { showBar: boolean; barBgClass: string } => {
  if (project.status === 'Cancelled') {
    return { showBar: false, barBgClass: '' };
  }
  if (isWorkComplete || project.status === 'Completed') {
    return { showBar: true, barBgClass: 'bg-emerald-500 dark:bg-emerald-400' };
  }
  if (project.impact > 0) {
    const impact = getImpactColors(project.impact);
    return { showBar: true, barBgClass: impact.accent.replace('border-l-', 'bg-') };
  }
  return { showBar: false, barBgClass: '' };
};

export const getImpactColors = (impact: number) => {
  if (impact >= 4)
    return {
      accent: 'border-l-amber-500 dark:border-l-amber-400',
      stars: 'text-amber-500 dark:text-amber-400',
      label: IMPACT_LABELS[impact] || 'High Impact',
    };
  if (impact === 3)
    return {
      accent: 'border-l-yellow-500 dark:border-l-yellow-400',
      stars: 'text-yellow-500 dark:text-yellow-400',
      label: IMPACT_LABELS[impact] || 'Medium Impact',
    };
  return {
    accent: 'border-l-gray-300 dark:border-l-gray-600',
    stars: 'text-gray-400 dark:text-gray-500',
    label: IMPACT_LABELS[impact] || 'Low Impact',
  };
};

/** Overdue days beyond this threshold use muted long-overdue pill + card dimming (not red alarm). */
export const EXTREME_OVERDUE_DAYS = 60;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Days strictly past targetEndDate; 0 when not overdue or unset. */
export const getDaysPastTargetEnd = (
  endDate: string | null,
  options?: { nowMs?: number }
): number => {
  if (!endDate) return 0;
  const now = options?.nowMs ?? +new Date();
  const daysRemaining = Math.ceil((new Date(endDate).getTime() - now) / MS_PER_DAY);
  return daysRemaining < 0 ? Math.abs(daysRemaining) : 0;
};

const EXTREME_OVERDUE_PILL_CLASSES =
  'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/80';

export interface DateUrgencyResult {
  color: string;
  text: string | null;
  animate: string;
  dimCard: boolean;
}

export const getDateUrgency = (
  endDate: string | null,
  options?: { hideWhenComplete?: boolean; nowMs?: number }
): DateUrgencyResult | null => {
  if (!endDate) return null;
  if (options?.hideWhenComplete) {
    return { color: '', text: null, animate: '', dimCard: false };
  }
  const now = options?.nowMs ?? +new Date();
  const daysRemaining = Math.ceil((new Date(endDate).getTime() - now) / MS_PER_DAY);
  if (daysRemaining < 0) {
    const daysOverdue = Math.abs(daysRemaining);
    if (daysOverdue > EXTREME_OVERDUE_DAYS) {
      return {
        color: EXTREME_OVERDUE_PILL_CLASSES,
        text: `Long overdue · ${daysOverdue} days`,
        animate: '',
        dimCard: true,
      };
    }
    return {
      color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      text: `Overdue by ${daysOverdue} days`,
      animate: 'animate-pulse',
      dimCard: false,
    };
  }
  if (daysRemaining <= 7)
    return {
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      text: `Due in ${daysRemaining} days`,
      animate: '',
      dimCard: false,
    };
  if (daysRemaining <= 30)
    return {
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      text: `Due in ${daysRemaining} days`,
      animate: '',
      dimCard: false,
    };
  return {
    color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
    text: null,
    animate: '',
    dimCard: false,
  };
};

export const getScheduleHealth = (
  project: Project,
  progressPercent: number,
  hasHealthData?: boolean
) => {
  if (!hasHealthData) return null;
  if (!project.startDate || !project.targetEndDate) return null;
  if (project.status === 'Completed' || project.status === 'Cancelled') return null;
  if (progressPercent >= 100) return null;
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.targetEndDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

  const now = +new Date();
  if (now > end && progressPercent < 100) {
    const daysOverdue = Math.ceil((now - end) / MS_PER_DAY);
    if (daysOverdue > EXTREME_OVERDUE_DAYS) {
      return SCHEDULE_HEALTH_STYLES.abandoned;
    }
    return SCHEDULE_HEALTH_STYLES.overdue;
  }

  const elapsedRatio = clamp01((now - start) / (end - start));
  const progressRatio = clamp01(progressPercent / 100);
  const diff = progressRatio - elapsedRatio;

  if (diff >= 0.1) return SCHEDULE_HEALTH_STYLES.ahead;
  if (diff <= -0.1) return SCHEDULE_HEALTH_STYLES.behind;
  return SCHEDULE_HEALTH_STYLES.ontrack;
};
