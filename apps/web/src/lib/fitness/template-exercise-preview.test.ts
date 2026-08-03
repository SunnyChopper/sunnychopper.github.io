import { describe, expect, it } from 'vitest';
import { applyTemplateExerciseReorder } from '@/lib/fitness/template-exercise-preview';

describe('applyTemplateExerciseReorder', () => {
  it('moves an item when active and over differ', () => {
    expect(applyTemplateExerciseReorder(['a', 'b', 'c'], 'a', 'c')).toEqual(['b', 'c', 'a']);
  });

  it('returns the same array when over is null', () => {
    const ids = ['a', 'b'];
    expect(applyTemplateExerciseReorder(ids, 'a', null)).toBe(ids);
  });

  it('returns the same array when active equals over', () => {
    const ids = ['a', 'b'];
    expect(applyTemplateExerciseReorder(ids, 'a', 'a')).toBe(ids);
  });
});
