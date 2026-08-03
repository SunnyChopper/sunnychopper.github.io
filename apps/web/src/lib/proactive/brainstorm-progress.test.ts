import { describe, expect, it } from 'vitest';
import { resolveBrainstormProgress } from './brainstorm-progress';

describe('resolveBrainstormProgress', () => {
  it('returns inactive settled state when not pending', () => {
    const result = resolveBrainstormProgress(20_000, false);
    expect(result.isActive).toBe(false);
    expect(result.progressValue).toBe(100);
    expect(result.statusText).toBe('');
  });

  it('starts in Collecting phase', () => {
    const result = resolveBrainstormProgress(0, true);
    expect(result.phaseLabel).toBe('Collecting');
    expect(result.isActive).toBe(true);
    expect(result.statusText).toContain('workspace');
  });

  it('transitions to Analyzing after 12s', () => {
    const result = resolveBrainstormProgress(12_000, true);
    expect(result.phaseLabel).toBe('Analyzing');
    expect(result.statusText).toContain('opportunities');
  });

  it('transitions to Drafting after 30s', () => {
    const result = resolveBrainstormProgress(30_000, true);
    expect(result.phaseLabel).toBe('Drafting');
    expect(result.statusText).toContain('Drafting');
  });

  it('eases progress toward 90 by 45s and clamps', () => {
    const at45s = resolveBrainstormProgress(45_000, true);
    expect(at45s.progressValue).toBe(90);

    const beyond = resolveBrainstormProgress(120_000, true);
    expect(beyond.progressValue).toBe(90);
  });

  it('never exceeds progress cap while pending', () => {
    const result = resolveBrainstormProgress(999_999, true);
    expect(result.progressValue).toBeLessThanOrEqual(90);
  });
});
