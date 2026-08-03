import { describe, expect, it } from 'vitest';
import {
  clampFocusGoalProgress,
  FOCUS_GOALS_LIST_MIN_HEIGHT_PX,
  FOCUS_GOALS_SLOT_COUNT,
  formatFocusGoalDaysLabel,
  formatFocusGoalOverdueAriaLabel,
  resolveFocusGoalUrgency,
} from '@/lib/growth-system/focus-goals-surfaces';

describe('focus-goals-surfaces', () => {
  it('clamps progress between 0 and 100', () => {
    expect(clampFocusGoalProgress(150)).toBe(100);
    expect(clampFocusGoalProgress(-5)).toBe(0);
    expect(clampFocusGoalProgress(42)).toBe(42);
  });

  it('resolves urgency from days remaining', () => {
    expect(resolveFocusGoalUrgency(-1)).toBe('overdue');
    expect(resolveFocusGoalUrgency(2)).toBe('dueSoon');
    expect(resolveFocusGoalUrgency(10)).toBe('onTrack');
    expect(resolveFocusGoalUrgency(null)).toBe('onTrack');
  });

  it('formats overdue labels', () => {
    expect(formatFocusGoalDaysLabel(-62)).toBe('62d overdue');
    expect(formatFocusGoalOverdueAriaLabel(-62)).toBe('62 days overdue');
    expect(formatFocusGoalOverdueAriaLabel(-1)).toBe('1 day overdue');
  });

  it('reserves height for three slots', () => {
    expect(FOCUS_GOALS_LIST_MIN_HEIGHT_PX).toBe(140 * FOCUS_GOALS_SLOT_COUNT + 16 * 2);
  });
});
