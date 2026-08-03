import { describe, expect, it } from 'vitest';
import {
  buildWeeklyReviewRitualToast,
  weeklyReviewRitualToastStorageKey,
} from '../weekly-review-ritual-feedback';

describe('buildWeeklyReviewRitualToast', () => {
  it('returns null when no points awarded', () => {
    expect(buildWeeklyReviewRitualToast(0)).toBeNull();
  });

  it('returns manual finalize copy', () => {
    expect(buildWeeklyReviewRitualToast(25)).toEqual({
      title: '+25 pts',
      message: 'Weekly review finalized',
    });
  });

  it('returns auto finalize copy', () => {
    expect(buildWeeklyReviewRitualToast(25, { autoCompleted: true })).toEqual({
      title: '+25 pts',
      message: 'Prior week auto-finalized',
    });
  });
});

describe('weeklyReviewRitualToastStorageKey', () => {
  it('scopes by weekStart', () => {
    expect(weeklyReviewRitualToastStorageKey('2026-04-13')).toBe(
      'weekly-review-ritual-toast:2026-04-13'
    );
  });
});
