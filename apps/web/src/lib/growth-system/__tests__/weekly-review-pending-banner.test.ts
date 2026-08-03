import { describe, expect, it } from 'vitest';

import { weeklyReviewPendingBannerCopy } from '@/lib/growth-system/weekly-review-pending-banner';
import type { WeeklyReviewCurrentDashboard } from '@/types/growth-system';

const baseCurrent: WeeklyReviewCurrentDashboard = {
  weekStart: '2026-07-27',
  weekEnd: '2026-08-02',
  weeklyReviewDate: '2026-08-02',
  isMidWeek: false,
  hasGeneratedReview: false,
  pendingReview: true,
  statsPartial: {
    tasksCompleted: 0,
    tasksPlanned: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    habitCompletions: 0,
    habitTargets: 0,
    metricsLogged: 0,
    goalsActive: 0,
    goalsAtRisk: 0,
    journalEntries: 0,
  },
  velocityData: [],
  trailingAverageStoryPoints: 0,
  currentWeekStoryPoints: 0,
  rollingAverageStoryPoints: [],
  localDate: '2026-08-02',
};

describe('weeklyReviewPendingBannerCopy', () => {
  it('uses due-today copy on the configured review day', () => {
    const copy = weeklyReviewPendingBannerCopy(baseCurrent);
    expect(copy.body).toContain('Today is your review day');
    expect(copy.body).not.toContain('has passed');
    expect(copy.ctaLabel).toBe('Start weekly review');
  });

  it('uses overdue copy after the review day', () => {
    const copy = weeklyReviewPendingBannerCopy({
      ...baseCurrent,
      localDate: '2026-08-03',
    });
    expect(copy.body).toContain('has passed');
    expect(copy.ctaLabel).toBe('Start weekly review');
  });

  it('uses draft copy when a generated review exists', () => {
    const copy = weeklyReviewPendingBannerCopy({
      ...baseCurrent,
      hasGeneratedReview: true,
    });
    expect(copy.body).toContain('unfinished review');
    expect(copy.body).not.toContain('has passed');
    expect(copy.ctaLabel).toBe('Resume weekly review');
  });
});
