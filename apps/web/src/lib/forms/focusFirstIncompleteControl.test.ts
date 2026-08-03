import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { focusFirstIncompleteControl } from './focusFirstIncompleteControl';

describe('focusFirstIncompleteControl', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('focuses the first incomplete target in order', () => {
    const focusA = vi.fn();
    const focusB = vi.fn();

    const focused = focusFirstIncompleteControl([
      { id: 'a', isComplete: () => true, focus: focusA },
      { id: 'b', isComplete: () => false, focus: focusB },
      { id: 'c', isComplete: () => false, focus: vi.fn() },
    ]);

    expect(focused).toBe(true);
    expect(focusA).not.toHaveBeenCalled();
    expect(focusB).toHaveBeenCalledTimes(1);
  });

  it('returns false when all targets are complete', () => {
    const focus = vi.fn();
    const focused = focusFirstIncompleteControl([
      { id: 'a', isComplete: () => true, focus },
      { id: 'b', isComplete: () => true, focus },
    ]);

    expect(focused).toBe(false);
    expect(focus).not.toHaveBeenCalled();
  });

  it('focuses the first target when none are complete', () => {
    const focusA = vi.fn();
    const focusB = vi.fn();

    focusFirstIncompleteControl([
      { id: 'a', isComplete: () => false, focus: focusA },
      { id: 'b', isComplete: () => false, focus: focusB },
    ]);

    expect(focusA).toHaveBeenCalledTimes(1);
    expect(focusB).not.toHaveBeenCalled();
  });
});
