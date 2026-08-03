/** Toast copy after weekly review ritual completion awards wallet points. */

export type WeeklyReviewRitualToast = {
  title: string;
  message: string;
};

export function buildWeeklyReviewRitualToast(
  ritualPointsAwarded: number,
  options?: { autoCompleted?: boolean | null }
): WeeklyReviewRitualToast | null {
  if (ritualPointsAwarded <= 0) return null;
  return {
    title: `+${ritualPointsAwarded} pts`,
    message: options?.autoCompleted ? 'Prior week auto-finalized' : 'Weekly review finalized',
  };
}

export function weeklyReviewRitualToastStorageKey(weekStart: string): string {
  return `weekly-review-ritual-toast:${weekStart}`;
}

export function shouldShowWeeklyReviewRitualToast(weekStart: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(weeklyReviewRitualToastStorageKey(weekStart)) !== '1';
}

export function markWeeklyReviewRitualToastShown(weekStart: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(weeklyReviewRitualToastStorageKey(weekStart), '1');
}
