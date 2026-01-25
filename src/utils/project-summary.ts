import type { Project } from '@/types/growth-system';
import { IMPACT_LABELS, SCHEDULE_HEALTH_STYLES } from '@/constants/project-summary';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

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

export const getDateUrgency = (endDate: string | null) => {
  if (!endDate) return null;
  const now = +new Date();
  const daysRemaining = Math.ceil((new Date(endDate).getTime() - now) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0)
    return {
      color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      text: `Overdue by ${Math.abs(daysRemaining)} days`,
      animate: 'animate-pulse',
    };
  if (daysRemaining <= 7)
    return {
      color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      text: `Due in ${daysRemaining} days`,
      animate: '',
    };
  if (daysRemaining <= 30)
    return {
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
      text: `Due in ${daysRemaining} days`,
      animate: '',
    };
  return {
    color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700',
    text: null,
    animate: '',
  };
};

export const getScheduleHealth = (
  project: Project,
  progressPercent: number,
  hasHealthData?: boolean
) => {
  if (!hasHealthData) return null;
  if (!project.startDate || !project.endDate) return null;
  if (project.status === 'Completed' || project.status === 'Cancelled') return null;
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

  const now = +new Date();
  if (now > end && progressPercent < 100) {
    return SCHEDULE_HEALTH_STYLES.overdue;
  }

  const elapsedRatio = clamp01((now - start) / (end - start));
  const progressRatio = clamp01(progressPercent / 100);
  const diff = progressRatio - elapsedRatio;

  if (diff >= 0.1) return SCHEDULE_HEALTH_STYLES.ahead;
  if (diff <= -0.1) return SCHEDULE_HEALTH_STYLES.behind;
  return SCHEDULE_HEALTH_STYLES.ontrack;
};
