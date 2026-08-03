import { describe, expect, it } from 'vitest';
import { getClusterGapClassName, getClusterPosition } from '@/lib/chat/message-cluster';

describe('getClusterPosition', () => {
  it('returns solo for isolated message', () => {
    expect(getClusterPosition(null, 'user', null)).toBe('solo');
  });

  it('returns first when followed by same role', () => {
    expect(getClusterPosition(null, 'assistant', 'assistant')).toBe('first');
  });

  it('returns middle when sandwiched', () => {
    expect(getClusterPosition('user', 'user', 'user')).toBe('middle');
  });

  it('returns last when preceded by same role only', () => {
    expect(getClusterPosition('assistant', 'assistant', null)).toBe('last');
  });
});

describe('getClusterGapClassName', () => {
  it('uses tight gap for same sender', () => {
    expect(getClusterGapClassName('user', 'user')).toBe('mt-0.5');
  });

  it('uses wide gap for sender change', () => {
    expect(getClusterGapClassName('user', 'assistant')).toBe('mt-3');
  });
});
