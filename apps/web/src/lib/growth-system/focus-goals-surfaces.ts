/** Shared surface tokens for Dashboard Focus Goals card and rows. */

export const FOCUS_GOALS_SLOT_COUNT = 3;
export const FOCUS_GOAL_ROW_MIN_H_PX = 140;
export const FOCUS_GOALS_LIST_GAP_PX = 16;

/** min-height for list region: 3 rows + 2 gaps */
export const FOCUS_GOALS_LIST_MIN_HEIGHT_PX =
  FOCUS_GOALS_SLOT_COUNT * FOCUS_GOAL_ROW_MIN_H_PX +
  (FOCUS_GOALS_SLOT_COUNT - 1) * FOCUS_GOALS_LIST_GAP_PX;

export const focusGoalsCardShellClassName =
  'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6';

export const focusGoalsHeaderClassName = 'flex items-center justify-between mb-6';

export const focusGoalsTitleClassName =
  'text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2';

export const focusGoalsViewAllLinkClassName =
  'text-xs font-medium accent-text-600 dark:accent-text-400 hover:underline underline-offset-2 shrink-0 inline-flex items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800';

export const focusGoalsListClassName = 'space-y-4 flex flex-col';

export const focusGoalsListMinHeightStyle = {
  minHeight: `${FOCUS_GOALS_LIST_MIN_HEIGHT_PX}px`,
} as const;

export const focusGoalRowLinkClassName =
  'block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800';

export const focusGoalRowMetaClassName = 'flex flex-wrap items-center gap-2 mt-1 min-w-0';

export const focusGoalCadenceClassName = 'text-xs text-gray-500 dark:text-gray-400';

export const focusGoalFooterClassName =
  'flex items-center justify-between text-xs mt-auto pt-1 gap-3';

export const focusGoalPercentClassName = 'flex items-center gap-1 text-gray-600 dark:text-gray-400';

export const focusGoalEmptyCopyClassName = 'text-sm text-gray-500 dark:text-gray-400 text-center';

export const focusGoalEmptyCtaClassName =
  'w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800';

export type FocusGoalUrgency = 'overdue' | 'dueSoon' | 'onTrack';

export function clampFocusGoalProgress(progress: number): number {
  return Math.min(100, Math.max(0, progress));
}

export function resolveFocusGoalUrgency(daysRemaining: number | null): FocusGoalUrgency {
  if (daysRemaining === null) return 'onTrack';
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 3) return 'dueSoon';
  return 'onTrack';
}

const rowShellBaseClassName =
  'p-4 rounded-lg border transition-colors group min-h-[140px] flex flex-col';

const rowUrgencyShellClassName: Record<FocusGoalUrgency, string> = {
  overdue:
    'bg-gradient-to-br from-red-50/60 to-white dark:from-red-950/30 dark:to-gray-800 border border-gray-200 dark:border-gray-600 border-l-4 border-l-red-500 hover:border-red-400/70 dark:hover:border-red-500/70',
  dueSoon:
    'bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/25 dark:to-gray-800 border border-gray-200 dark:border-gray-600 border-l-4 border-l-amber-500 hover:border-amber-400/70 dark:hover:border-amber-500/70',
  onTrack:
    'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400',
};

export function focusGoalRowShellClassName(urgency: FocusGoalUrgency): string {
  return `${rowShellBaseClassName} ${rowUrgencyShellClassName[urgency]}`;
}

const dateChipClassName: Record<FocusGoalUrgency, string> = {
  overdue:
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-red-700 dark:text-red-300 bg-red-100/90 dark:bg-red-950/50',
  dueSoon:
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/40',
  onTrack: 'inline-flex items-center gap-1 text-gray-600 dark:text-gray-400',
};

export function focusGoalDateChipClassName(urgency: FocusGoalUrgency): string {
  return dateChipClassName[urgency];
}

export function focusGoalProgressRingColor(
  urgency: FocusGoalUrgency
): 'blue' | 'green' | 'orange' | 'red' {
  if (urgency === 'overdue') return 'red';
  if (urgency === 'dueSoon') return 'orange';
  return 'blue';
}

export function focusGoalProgressFillClassName(progress: number): string {
  const clamped = clampFocusGoalProgress(progress);
  if (clamped >= 75) return 'bg-green-500';
  if (clamped >= 50) return 'bg-blue-500';
  if (clamped >= 25) return 'bg-yellow-500';
  return 'bg-orange-500';
}

export function formatFocusGoalDaysLabel(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return `${Math.abs(daysRemaining)}d overdue`;
  }
  if (daysRemaining === 0) {
    return 'Due today';
  }
  return `${daysRemaining}d left`;
}

export function formatFocusGoalOverdueAriaLabel(daysRemaining: number): string {
  const days = Math.abs(daysRemaining);
  return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
}
