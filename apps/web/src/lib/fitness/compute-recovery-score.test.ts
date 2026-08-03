import { describe, expect, it } from 'vitest';
import { computeRecoveryScore } from '@/lib/fitness/compute-recovery-score';

describe('computeRecoveryScore', () => {
  it('returns null when no score-contributing fields are set', () => {
    expect(computeRecoveryScore({})).toBeNull();
    expect(
      computeRecoveryScore({
        sleepHours: null,
        sleepQuality: null,
        energyLevel: null,
        sorenessLevel: null,
      })
    ).toBeNull();
  });

  it('computes from a single field', () => {
    expect(computeRecoveryScore({ energyLevel: 6 })).toBe(60);
    expect(computeRecoveryScore({ sleepQuality: 7 })).toBe(70);
    expect(computeRecoveryScore({ sorenessLevel: 3 })).toBe(70);
    expect(computeRecoveryScore({ sleepHours: 8 })).toBe(100);
  });

  it('caps sleep hours contribution at 100', () => {
    expect(computeRecoveryScore({ sleepHours: 10 })).toBe(100);
  });

  it('ignores invalid sleep hours', () => {
    expect(computeRecoveryScore({ sleepHours: Number.NaN })).toBeNull();
  });

  it('matches backend equal-weight average for full fixture', () => {
    // 7.5h → 93.75, quality 7 → 70, energy 6 → 60, soreness 3 → 70
    const score = computeRecoveryScore({
      sleepHours: 7.5,
      sleepQuality: 7,
      energyLevel: 6,
      sorenessLevel: 3,
    });
    expect(score).toBe(73.44);
  });

  it('averages only available parts', () => {
    expect(
      computeRecoveryScore({
        sleepHours: 7,
        energyLevel: 5,
      })
    ).toBe(68.75);
  });
});
