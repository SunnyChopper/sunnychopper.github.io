export type RecoveryCapacityBand = 'unknown' | 'low' | 'moderate' | 'recovered';

export type RecoveryCapacityStatus = {
  band: RecoveryCapacityBand;
  sentence: string;
};

const LOW_THRESHOLD = 40;
const RECOVERED_THRESHOLD = 70;

/**
 * Map a recovery score (0–100) to a one-line capacity status for the Capacity Hub hero.
 * `null` means no score-contributing fields are set.
 */
export function recoveryCapacityStatus(score: number | null | undefined): RecoveryCapacityStatus {
  if (score == null || !Number.isFinite(score)) {
    return {
      band: 'unknown',
      sentence: 'No recovery logged · capacity unknown',
    };
  }

  if (score < LOW_THRESHOLD) {
    return {
      band: 'low',
      sentence: 'Low energy · protect capacity',
    };
  }

  if (score < RECOVERED_THRESHOLD) {
    return {
      band: 'moderate',
      sentence: 'Moderate · train with intent',
    };
  }

  return {
    band: 'recovered',
    sentence: 'Recovered · ready for volume',
  };
}
