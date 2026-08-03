import { afterEach, describe, expect, it } from 'vitest';
import {
  pushRecentExerciseId,
  readRecentExerciseIds,
  RECENT_CHIP_DISPLAY,
} from './recent-exercises';

const STORAGE_KEY = 'personalos.fitness.recentExerciseIds.v1';

describe('recent-exercises', () => {
  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it('exports RECENT_CHIP_DISPLAY as 6', () => {
    expect(RECENT_CHIP_DISPLAY).toBe(6);
  });

  it('returns empty when storage is missing', () => {
    expect(readRecentExerciseIds()).toEqual([]);
  });

  it('pushes ids to MRU front and dedupes', () => {
    pushRecentExerciseId('a');
    pushRecentExerciseId('b');
    pushRecentExerciseId('a');
    expect(readRecentExerciseIds()).toEqual(['a', 'b']);
  });

  it('caps list at 8 entries', () => {
    for (let i = 1; i <= 10; i++) {
      pushRecentExerciseId(`id-${i}`);
    }
    expect(readRecentExerciseIds()).toHaveLength(8);
    expect(readRecentExerciseIds()[0]).toBe('id-10');
  });

  it('ignores blank ids', () => {
    pushRecentExerciseId('valid');
    pushRecentExerciseId('   ');
    expect(readRecentExerciseIds()).toEqual(['valid']);
  });

  it('returns safe empty on corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(readRecentExerciseIds()).toEqual([]);
  });
});
