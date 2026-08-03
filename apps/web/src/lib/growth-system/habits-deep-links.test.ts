import { describe, expect, it } from 'vitest';
import { habitsDeepLinkHref } from '@/lib/growth-system/habits-deep-links';

describe('habits-deep-links', () => {
  it('builds habit detail href', () => {
    expect(habitsDeepLinkHref('h1')).toBe('/admin/habits?habitId=h1');
  });
});
