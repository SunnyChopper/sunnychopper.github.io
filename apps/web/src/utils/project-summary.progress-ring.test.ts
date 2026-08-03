import { describe, expect, it } from 'vitest';

import { getProjectBadgeStatus, projectProgressRingColor } from '@/utils/project-summary';

describe('projectProgressRingColor', () => {
  it.each([
    ['Active', 'green'],
    ['Completed', 'green'],
    ['Planning', 'amber'],
    ['Stale', 'muted'],
    ['Cancelled', 'muted'],
    ['Unknown', 'muted'],
  ] as const)('maps %s to %s', (status, expected) => {
    expect(projectProgressRingColor(status)).toBe(expected);
  });
});

describe('getProjectBadgeStatus', () => {
  it('returns Stale when isStale is true', () => {
    expect(getProjectBadgeStatus('Active', true)).toBe('Stale');
  });

  it('returns effective status when not stale', () => {
    expect(getProjectBadgeStatus('Planning', false)).toBe('Planning');
  });
});
