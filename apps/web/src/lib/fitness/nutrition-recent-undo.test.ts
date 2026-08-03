import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clampSwipeOffset,
  formatNutritionRecentMacros,
  NUTRITION_RECENT_SWIPE_COMMIT_PX,
  NUTRITION_RECENT_UNDO_MS,
  scheduleDeferredDelete,
  shouldCommitSwipeDelete,
} from '@/lib/fitness/nutrition-recent-undo';

describe('nutrition-recent-undo helpers', () => {
  it('uses 8 second undo toast duration', () => {
    expect(NUTRITION_RECENT_UNDO_MS).toBe(8000);
  });

  it('formats macros in compact mono style', () => {
    expect(
      formatNutritionRecentMacros({
        calories: 518.4,
        proteinGrams: 42.1,
        carbGrams: 38.9,
        fatGrams: 18.2,
      })
    ).toBe('518 kcal · P42 C39 F18');
  });

  it('clamps swipe offset to left with rubber band past max reveal', () => {
    expect(clampSwipeOffset(12)).toBe(0);
    expect(clampSwipeOffset(-40)).toBe(-40);
    expect(clampSwipeOffset(-100)).toBeLessThan(-88);
  });

  it('commits swipe delete past threshold', () => {
    expect(shouldCommitSwipeDelete(-NUTRITION_RECENT_SWIPE_COMMIT_PX)).toBe(true);
    expect(shouldCommitSwipeDelete(-NUTRITION_RECENT_SWIPE_COMMIT_PX + 1)).toBe(false);
  });

  describe('scheduleDeferredDelete', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('commits after delay when not cancelled', () => {
      const onCommit = vi.fn();
      scheduleDeferredDelete(onCommit, 1000);
      expect(onCommit).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(onCommit).toHaveBeenCalledOnce();
    });

    it('does not commit when cancelled before delay', () => {
      const onCommit = vi.fn();
      const handle = scheduleDeferredDelete(onCommit, 1000);
      handle.cancel();
      vi.advanceTimersByTime(1000);
      expect(onCommit).not.toHaveBeenCalled();
    });
  });
});
