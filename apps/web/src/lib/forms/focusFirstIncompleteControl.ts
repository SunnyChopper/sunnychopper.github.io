export type FocusTarget = {
  id: string;
  isComplete: () => boolean;
  focus: () => void;
};

/**
 * Focus the first control in DOM order whose `isComplete()` returns false.
 * Uses requestAnimationFrame so focus runs after layout (e.g. dialog mount).
 */
export function focusFirstIncompleteControl(targets: FocusTarget[]): boolean {
  const next = targets.find((target) => !target.isComplete());
  if (!next) return false;

  const runFocus = () => {
    next.focus();
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(runFocus);
  } else {
    runFocus();
  }

  return true;
}
