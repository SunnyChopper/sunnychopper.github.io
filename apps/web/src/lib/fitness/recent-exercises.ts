const STORAGE_KEY = 'personalos.fitness.recentExerciseIds.v1';
const MAX_RECENT = 8;

/** Max chips shown under New exercise. */
export const RECENT_CHIP_DISPLAY = 6;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readRecentExerciseIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
  } catch {
    return [];
  }
}

/** Push id to MRU list; returns the updated list. */
export function pushRecentExerciseId(id: string): string[] {
  const trimmed = id.trim();
  if (!trimmed || !canUseStorage()) return readRecentExerciseIds();

  const prev = readRecentExerciseIds().filter((x) => x !== trimmed);
  const next = [trimmed, ...prev].slice(0, MAX_RECENT);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private-mode errors
  }

  return next;
}
