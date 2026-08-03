import { describe, expect, it } from 'vitest';

import {
  formatPastReviewSecondaryLine,
  groupPastReviewsByMonth,
  relativePastWeekLabel,
  resolvePastReviewTriggerLabel,
  weeksBetweenMondays,
} from '@/lib/growth-system/past-reviews-dropdown';

describe('past-reviews-dropdown helpers', () => {
  it('computes integer week distance between Mondays', () => {
    expect(weeksBetweenMondays('2026-07-27', '2026-07-20')).toBe(1);
    expect(weeksBetweenMondays('2026-07-27', '2026-07-13')).toBe(2);
    expect(weeksBetweenMondays('2026-07-27', '2026-07-06')).toBe(3);
    expect(weeksBetweenMondays('2026-07-27', '2026-06-29')).toBe(4);
  });

  it('returns relative labels for distances 1–3 only', () => {
    expect(relativePastWeekLabel(1)).toBe('Last week');
    expect(relativePastWeekLabel(2)).toBe('2 weeks ago');
    expect(relativePastWeekLabel(3)).toBe('3 weeks ago');
    expect(relativePastWeekLabel(4)).toBeNull();
    expect(relativePastWeekLabel(0)).toBeNull();
  });

  it('formats secondary line with and without auto-completed', () => {
    expect(
      formatPastReviewSecondaryLine({
        weekStart: '2026-07-20',
        status: 'completed',
        autoCompleted: true,
      })
    ).toBe('Week of 2026-07-20 (completed · auto-completed)');

    expect(
      formatPastReviewSecondaryLine({
        weekStart: '2026-07-13',
        status: 'planned',
        autoCompleted: false,
      })
    ).toBe('Week of 2026-07-13 (planned)');
  });

  it('groups by weekStart month while preserving newest-first order', () => {
    const reviews = [
      { weekStart: '2026-07-20', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-07-13', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-06-29', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-06-22', status: 'completed' as const, autoCompleted: true },
    ];

    const groups = groupPastReviewsByMonth(reviews, '2026-07-27');

    expect(groups).toHaveLength(2);
    expect(groups[0].monthLabel).toBe('July 2026');
    expect(groups[0].items.map((i) => i.weekStart)).toEqual(['2026-07-20', '2026-07-13']);
    expect(groups[1].monthLabel).toBe('June 2026');
    expect(groups[1].items.map((i) => i.weekStart)).toEqual(['2026-06-29', '2026-06-22']);
  });

  it('assigns relative primary labels for the three most recent past weeks', () => {
    const reviews = [
      { weekStart: '2026-07-20', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-07-13', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-07-06', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-06-29', status: 'completed' as const, autoCompleted: true },
    ];

    const groups = groupPastReviewsByMonth(reviews, '2026-07-27');
    const labels = groups.flatMap((g) => g.items.map((i) => i.primaryLabel));

    expect(labels).toEqual(['Last week', '2 weeks ago', '3 weeks ago', 'Week of 2026-06-29']);
  });

  it('resolves trigger label for current/auto and selected weeks', () => {
    const reviews = [
      { weekStart: '2026-07-20', status: 'completed' as const, autoCompleted: true },
      { weekStart: '2026-06-29', status: 'completed' as const, autoCompleted: true },
    ];

    expect(resolvePastReviewTriggerLabel('', reviews, '2026-07-27')).toBe('Current / auto');
    expect(resolvePastReviewTriggerLabel('2026-07-20', reviews, '2026-07-27')).toBe('Last week');
    expect(resolvePastReviewTriggerLabel('2026-06-29', reviews, '2026-07-27')).toBe(
      'Week of 2026-06-29'
    );
  });
});
