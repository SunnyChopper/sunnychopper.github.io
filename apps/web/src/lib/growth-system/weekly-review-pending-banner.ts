import type { WeeklyReviewCurrentDashboard } from '@/types/growth-system';

export function weeklyReviewPendingBannerCopy(current: WeeklyReviewCurrentDashboard): {
  body: string;
  ctaLabel: string;
} {
  if (current.hasGeneratedReview) {
    return {
      body: `You have an unfinished review for week ${current.weekStart}. Resume when you are ready—or discard the draft to keep tracking as usual.`,
      ctaLabel: 'Resume weekly review',
    };
  }
  if (current.localDate && current.localDate === current.weeklyReviewDate) {
    return {
      body: `Today is your review day for week ${current.weekStart}. Generate a draft review to reflect and plan, then finalize when you are ready.`,
      ctaLabel: 'Start weekly review',
    };
  }
  return {
    body: `Your review day has passed for week ${current.weekStart}. Generate a draft review to reflect and plan, then finalize when you are ready—or discard the draft to keep tracking as usual.`,
    ctaLabel: 'Start weekly review',
  };
}
