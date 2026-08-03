import { describe, expect, it } from 'vitest';
import { recoveryCapacityStatus } from '@/lib/fitness/recovery-capacity-status';

describe('recoveryCapacityStatus', () => {
  it('returns unknown when score is null', () => {
    expect(recoveryCapacityStatus(null)).toEqual({
      band: 'unknown',
      sentence: 'No recovery logged · capacity unknown',
    });
  });

  it('returns unknown when score is undefined', () => {
    expect(recoveryCapacityStatus(undefined)).toEqual({
      band: 'unknown',
      sentence: 'No recovery logged · capacity unknown',
    });
  });

  it('returns low below 40', () => {
    expect(recoveryCapacityStatus(39)).toEqual({
      band: 'low',
      sentence: 'Low energy · protect capacity',
    });
  });

  it('returns moderate from 40 through 69', () => {
    expect(recoveryCapacityStatus(40)).toEqual({
      band: 'moderate',
      sentence: 'Moderate · train with intent',
    });
    expect(recoveryCapacityStatus(69)).toEqual({
      band: 'moderate',
      sentence: 'Moderate · train with intent',
    });
  });

  it('returns recovered at 70 and above', () => {
    expect(recoveryCapacityStatus(70)).toEqual({
      band: 'recovered',
      sentence: 'Recovered · ready for volume',
    });
    expect(recoveryCapacityStatus(100)).toEqual({
      band: 'recovered',
      sentence: 'Recovered · ready for volume',
    });
  });
});
