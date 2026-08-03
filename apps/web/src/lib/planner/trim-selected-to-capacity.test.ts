import { describe, expect, it } from 'vitest';

import type { PlanDaySuggestion } from '@/types/planner';

import {
  compareForCapacityRemoval,
  formatCapacityExcessPoints,
  parsePriorityRank,
  trimSelectedToCapacity,
} from './trim-selected-to-capacity';

function suggestion(
  partial: Partial<PlanDaySuggestion> & Pick<PlanDaySuggestion, 'taskId'>
): PlanDaySuggestion {
  return {
    title: partial.title ?? partial.taskId,
    storyPoints: partial.storyPoints ?? 3,
    priority: partial.priority ?? 'P2',
    score: partial.score ?? 50,
    reason: 'test',
    ...partial,
  };
}

describe('parsePriorityRank', () => {
  it('parses P1/P2/P3', () => {
    expect(parsePriorityRank('P1')).toBe(1);
    expect(parsePriorityRank('p3')).toBe(3);
  });

  it('treats unknown priority as worst', () => {
    expect(parsePriorityRank('urgent')).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('compareForCapacityRemoval', () => {
  it('prefers removing lower priority (higher P number)', () => {
    const p1 = suggestion({ taskId: 'a', priority: 'P1', score: 10 });
    const p3 = suggestion({ taskId: 'b', priority: 'P3', score: 100 });
    expect(compareForCapacityRemoval(p3, p1)).toBeGreaterThan(0);
    expect(compareForCapacityRemoval(p1, p3)).toBeLessThan(0);
  });

  it('breaks ties with lower score', () => {
    const low = suggestion({ taskId: 'a', priority: 'P2', score: 10 });
    const high = suggestion({ taskId: 'b', priority: 'P2', score: 90 });
    expect(compareForCapacityRemoval(low, high)).toBeGreaterThan(0);
  });

  it('breaks score ties with higher story points', () => {
    const big = suggestion({ taskId: 'a', priority: 'P2', score: 50, storyPoints: 8 });
    const small = suggestion({ taskId: 'b', priority: 'P2', score: 50, storyPoints: 2 });
    expect(compareForCapacityRemoval(big, small)).toBeGreaterThan(0);
  });
});

describe('trimSelectedToCapacity', () => {
  const suggestions = [
    suggestion({ taskId: 'keep', priority: 'P1', score: 100, storyPoints: 3 }),
    suggestion({ taskId: 'drop', priority: 'P3', score: 10, storyPoints: 5 }),
    suggestion({ taskId: 'also-drop', priority: 'P3', score: 5, storyPoints: 2 }),
  ];

  it('removes lowest-priority tasks until within capacity', () => {
    const result = trimSelectedToCapacity({
      selectedIds: new Set(['keep', 'drop', 'also-drop']),
      suggestions,
      capacityPoints: 4,
    });

    expect([...result.selectedIds]).toEqual(['keep']);
    expect(result.removedIds).toEqual(['also-drop', 'drop']);
  });

  it('removes a single oversized task', () => {
    const oversized = suggestion({ taskId: 'big', priority: 'P1', score: 100, storyPoints: 8 });
    const result = trimSelectedToCapacity({
      selectedIds: new Set(['big']),
      suggestions: [oversized],
      capacityPoints: 4.3,
    });

    expect(result.selectedIds.size).toBe(0);
    expect(result.removedIds).toEqual(['big']);
  });

  it('leaves selection unchanged when already within capacity', () => {
    const result = trimSelectedToCapacity({
      selectedIds: new Set(['keep']),
      suggestions,
      capacityPoints: 5,
    });

    expect([...result.selectedIds]).toEqual(['keep']);
    expect(result.removedIds).toEqual([]);
  });
});

describe('formatCapacityExcessPoints', () => {
  it('formats excess to one decimal', () => {
    expect(formatCapacityExcessPoints(8, 4.3)).toBe('3.7 pts over capacity');
  });
});
