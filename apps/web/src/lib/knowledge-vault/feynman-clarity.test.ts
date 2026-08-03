import { describe, expect, it } from 'vitest';

import { clarityRingColor, toClarityPercent } from '@/lib/knowledge-vault/feynman-clarity';

describe('feynman-clarity helpers', () => {
  it('toClarityPercent rounds score to 0–100', () => {
    expect(toClarityPercent(0.72)).toBe(72);
    expect(toClarityPercent(0.495)).toBe(50);
    expect(toClarityPercent(null)).toBeNull();
    expect(toClarityPercent(undefined)).toBeNull();
  });

  it('clarityRingColor applies red / amber / green bands', () => {
    expect(clarityRingColor(null)).toBe('muted');
    expect(clarityRingColor(49)).toBe('red');
    expect(clarityRingColor(50)).toBe('amber');
    expect(clarityRingColor(80)).toBe('amber');
    expect(clarityRingColor(81)).toBe('green');
  });
});
