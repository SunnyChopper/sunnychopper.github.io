export const NUTRITION_RECENT_UNDO_MS = 8000;
export const NUTRITION_RECENT_SWIPE_COMMIT_PX = 76;

export interface NutritionMacroFields {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
}

export function formatNutritionRecentMacros(entry: NutritionMacroFields): string {
  return `${Math.round(entry.calories)} kcal · P${entry.proteinGrams.toFixed(0)} C${entry.carbGrams.toFixed(0)} F${entry.fatGrams.toFixed(0)}`;
}

export function clampSwipeOffset(offsetPx: number, maxRevealPx = 88): number {
  if (offsetPx > 0) return 0;
  if (offsetPx < -maxRevealPx) {
    const excess = -offsetPx - maxRevealPx;
    return -(maxRevealPx + excess * 0.25);
  }
  return offsetPx;
}

export interface DeferredDeleteHandle {
  cancel: () => void;
}

export function scheduleDeferredDelete(
  onCommit: () => void,
  delayMs = NUTRITION_RECENT_UNDO_MS
): DeferredDeleteHandle {
  const state = { cancelled: false };
  const timer = setTimeout(() => {
    if (!state.cancelled) {
      onCommit();
    }
  }, delayMs);

  return {
    cancel: () => {
      state.cancelled = true;
      clearTimeout(timer);
    },
  };
}

export function shouldCommitSwipeDelete(offsetPx: number): boolean {
  return offsetPx <= -NUTRITION_RECENT_SWIPE_COMMIT_PX;
}
