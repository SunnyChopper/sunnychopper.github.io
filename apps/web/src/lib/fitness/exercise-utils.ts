import type { FitnessExercise } from '@/types/fitness';

export function findExerciseByNameInsensitive(
  exercises: FitnessExercise[],
  name: string
): FitnessExercise | undefined {
  const q = name.trim().toLowerCase();
  if (!q) return undefined;
  return exercises.find((e) => e.name.trim().toLowerCase() === q);
}
