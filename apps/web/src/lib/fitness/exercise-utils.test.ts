import { describe, expect, it } from 'vitest';
import type { FitnessExercise } from '@/types/fitness';
import { findExerciseByNameInsensitive } from './exercise-utils';

function makeExercise(
  overrides: Partial<FitnessExercise> & Pick<FitnessExercise, 'id' | 'name'>
): FitnessExercise {
  return {
    userId: 'user-1',
    movementPattern: 'push',
    unit: 'pounds',
    defaultRepRangeMin: 5,
    defaultRepRangeMax: 8,
    incrementMode: 'fixed',
    incrementAmount: 2.5,
    deloadPercent: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('findExerciseByNameInsensitive', () => {
  const exercises = [
    makeExercise({ id: '1', name: 'Bench press' }),
    makeExercise({ id: '2', name: 'Squat' }),
  ];

  it('matches case-insensitively with surrounding whitespace', () => {
    expect(findExerciseByNameInsensitive(exercises, '  BENCH PRESS  ')?.id).toBe('1');
  });

  it('returns undefined for empty or unknown names', () => {
    expect(findExerciseByNameInsensitive(exercises, '')).toBeUndefined();
    expect(findExerciseByNameInsensitive(exercises, 'Deadlift')).toBeUndefined();
  });
});
