export type RecoveryScoreInput = {
  sleepHours?: number | null;
  sleepQuality?: number | null;
  energyLevel?: number | null;
  sorenessLevel?: number | null;
};

/**
 * Mirror of backend `_compute_recovery_score` in fitness.py.
 * Returns 0–100 composite or null when no score-contributing fields are set.
 */
export function computeRecoveryScore(input: RecoveryScoreInput): number | null {
  const parts: number[] = [];

  const { sleepHours, sleepQuality, energyLevel, sorenessLevel } = input;

  if (sleepHours != null && Number.isFinite(sleepHours)) {
    parts.push(Math.min(100, (sleepHours / 8) * 100));
  }

  if (sleepQuality != null && Number.isFinite(sleepQuality)) {
    parts.push(sleepQuality * 10);
  }

  if (energyLevel != null && Number.isFinite(energyLevel)) {
    parts.push(energyLevel * 10);
  }

  if (sorenessLevel != null && Number.isFinite(sorenessLevel)) {
    parts.push(Math.max(0, (10 - sorenessLevel) * 10));
  }

  if (parts.length === 0) {
    return null;
  }

  const sum = parts.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / parts.length) * 100) / 100;
}
