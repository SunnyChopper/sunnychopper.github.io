import type { WeeklyReview, WeeklyReviewStatus } from '@/types/growth-system';

export interface PastReviewMenuItem {
  weekStart: string;
  primaryLabel: string;
  secondaryLabel: string;
  status: WeeklyReviewStatus;
  autoCompleted?: boolean | null;
}

export interface PastReviewMonthGroup {
  monthKey: string;
  monthLabel: string;
  items: PastReviewMenuItem[];
}

function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Integer week distance between two Monday ISO dates (anchor minus review). */
export function weeksBetweenMondays(anchorWeekStart: string, reviewWeekStart: string): number {
  const anchor = parseLocalDate(anchorWeekStart);
  const review = parseLocalDate(reviewWeekStart);
  const diffMs = anchor.getTime() - review.getTime();
  return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function relativePastWeekLabel(distance: number): string | null {
  if (distance === 1) return 'Last week';
  if (distance === 2) return '2 weeks ago';
  if (distance === 3) return '3 weeks ago';
  return null;
}

export function formatPastReviewSecondaryLine(review: {
  weekStart: string;
  status: WeeklyReviewStatus;
  autoCompleted?: boolean | null;
}): string {
  return `Week of ${review.weekStart} (${review.status}${
    review.autoCompleted ? ' · auto-completed' : ''
  })`;
}

function monthKeyFromWeekStart(weekStart: string): string {
  return weekStart.slice(0, 7);
}

function monthLabelFromWeekStart(weekStart: string): string {
  const [y, m] = weekStart.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function buildPastReviewMenuItem(
  review: Pick<WeeklyReview, 'weekStart' | 'status' | 'autoCompleted'>,
  anchorWeekStart: string | null
): PastReviewMenuItem {
  const secondaryLabel = formatPastReviewSecondaryLine(review);
  let primaryLabel = `Week of ${review.weekStart}`;

  if (anchorWeekStart) {
    const distance = weeksBetweenMondays(anchorWeekStart, review.weekStart);
    const relative = relativePastWeekLabel(distance);
    if (relative) {
      primaryLabel = relative;
    }
  }

  return {
    weekStart: review.weekStart,
    primaryLabel,
    secondaryLabel,
    status: review.status,
    autoCompleted: review.autoCompleted,
  };
}

/** Group reviews by weekStart month; preserve API newest-first order. */
export function groupPastReviewsByMonth(
  reviews: Pick<WeeklyReview, 'weekStart' | 'status' | 'autoCompleted'>[],
  anchorWeekStart: string | null
): PastReviewMonthGroup[] {
  const groups: PastReviewMonthGroup[] = [];

  for (const review of reviews) {
    const monthKey = monthKeyFromWeekStart(review.weekStart);
    const item = buildPastReviewMenuItem(review, anchorWeekStart);
    const last = groups[groups.length - 1];

    if (last?.monthKey === monthKey) {
      last.items.push(item);
    } else {
      groups.push({
        monthKey,
        monthLabel: monthLabelFromWeekStart(review.weekStart),
        items: [item],
      });
    }
  }

  return groups;
}

export function resolvePastReviewTriggerLabel(
  value: string,
  reviews: Pick<WeeklyReview, 'weekStart' | 'status' | 'autoCompleted'>[],
  anchorWeekStart: string | null
): string {
  if (!value) return 'Current / auto';

  for (const group of groupPastReviewsByMonth(reviews, anchorWeekStart)) {
    const item = group.items.find((i) => i.weekStart === value);
    if (item) return item.primaryLabel;
  }

  return `Week of ${value}`;
}
