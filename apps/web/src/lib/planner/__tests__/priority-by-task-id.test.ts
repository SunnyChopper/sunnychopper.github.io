import { describe, expect, it } from 'vitest';

import type { Task } from '@/types/growth-system';
import { buildPriorityByTaskId, lookupTaskPriority } from '@/lib/planner/priority-by-task-id';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'priority'>): Task {
  return {
    title: 'Task',
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    status: 'Not Started',
    size: 3,
    dueDate: null,
    scheduledDate: null,
    completedDate: null,
    notes: null,
    isRecurring: false,
    recurrenceRule: null,
    pointValue: null,
    pointsAwarded: null,
    projectIds: [],
    goalIds: [],
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('priority-by-task-id', () => {
  it('builds a map of task id to priority', () => {
    const map = buildPriorityByTaskId([
      makeTask({ id: 'a', priority: 'P1' }),
      makeTask({ id: 'b', priority: 'P3' }),
    ]);
    expect(lookupTaskPriority(map, 'a')).toBe('P1');
    expect(lookupTaskPriority(map, 'b')).toBe('P3');
    expect(lookupTaskPriority(map, 'missing')).toBeUndefined();
  });

  it('lookup returns undefined for null task id or missing map', () => {
    const map = buildPriorityByTaskId([makeTask({ id: 'a', priority: 'P2' })]);
    expect(lookupTaskPriority(undefined, 'a')).toBeUndefined();
    expect(lookupTaskPriority(map, null)).toBeUndefined();
    expect(lookupTaskPriority(map, undefined)).toBeUndefined();
  });
});
