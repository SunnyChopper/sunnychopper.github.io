import { describe, expect, it } from 'vitest';
import type { Project, Task } from '@/types/growth-system';
import {
  buildImpactEffortPoints,
  classifyImpactEffortQuadrant,
  computeRemainingStoryPoints,
  hasUnestimatedRemainingTasks,
  medianPositive,
  partitionByQuadrant,
} from '@/lib/growth-system/impact-effort-matrix';

function makeProject(overrides: Partial<Project> & Pick<Project, 'id' | 'name'>): Project {
  return {
    description: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Active',
    impact: 3,
    startDate: null,
    targetEndDate: null,
    actualEndDate: null,
    notes: null,
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Backlog',
    size: null,
    dueDate: null,
    scheduledDate: null,
    completedDate: null,
    notes: null,
    isRecurring: false,
    recurrenceRule: null,
    pointValue: null,
    pointsAwarded: null,
    projectIds: ['p1'],
    goalIds: [],
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('impact-effort-matrix', () => {
  it('computeRemainingStoryPoints excludes Done tasks and null sizes', () => {
    const tasks = [
      makeTask({ id: 't1', title: 'Done', status: 'Done', size: 8 }),
      makeTask({ id: 't2', title: 'Open sized', status: 'Backlog', size: 5 }),
      makeTask({ id: 't3', title: 'Open unsized', status: 'Backlog' }),
    ];

    expect(computeRemainingStoryPoints(tasks)).toBe(5);
    expect(hasUnestimatedRemainingTasks(tasks)).toBe(true);
  });

  it('medianPositive returns 1 when all values are zero', () => {
    expect(medianPositive([0, 0, 0])).toBe(1);
  });

  it('medianPositive computes median for positive values', () => {
    expect(medianPositive([3, 8, 13])).toBe(8);
    expect(medianPositive([2, 5])).toBe(3.5);
  });

  it('classifyImpactEffortQuadrant uses impact 4+ and effort vs median', () => {
    expect(classifyImpactEffortQuadrant(5, 3, 5)).toBe('quickWins');
    expect(classifyImpactEffortQuadrant(4, 8, 5)).toBe('strategicBets');
    expect(classifyImpactEffortQuadrant(2, 2, 5)).toBe('fillIns');
    expect(classifyImpactEffortQuadrant(2, 8, 5)).toBe('killZone');
  });

  it('buildImpactEffortPoints marks unscored impact separately', () => {
    const projects = [
      makeProject({ id: 'p1', name: 'Scored', impact: 5 }),
      makeProject({ id: 'p2', name: 'Unscored', impact: 0 }),
    ];
    const tasks = [
      makeTask({ id: 't1', title: 'Work', projectIds: ['p1'], size: 3 }),
      makeTask({ id: 't2', title: 'Work', projectIds: ['p2'], size: 5 }),
    ];

    const points = buildImpactEffortPoints(projects, tasks);
    expect(points.find((p) => p.projectId === 'p1')?.quadrant).toBe('quickWins');
    expect(points.find((p) => p.projectId === 'p2')?.isUnscored).toBe(true);
    expect(points.find((p) => p.projectId === 'p2')?.quadrant).toBeNull();
  });

  it('partitionByQuadrant groups scored points only', () => {
    const projects = [
      makeProject({ id: 'p1', name: 'Kill', impact: 2 }),
      makeProject({ id: 'p2', name: 'Win', impact: 5 }),
      makeProject({ id: 'p3', name: 'Unscored', impact: 0 }),
    ];
    const tasks = [
      makeTask({ id: 't1', title: 'Heavy', projectIds: ['p1'], size: 13 }),
      makeTask({ id: 't2', title: 'Light', projectIds: ['p2'], size: 1 }),
      makeTask({ id: 't3', title: 'Other', projectIds: ['p3'], size: 8 }),
    ];

    const points = buildImpactEffortPoints(projects, tasks);
    const buckets = partitionByQuadrant(points);

    expect(buckets.killZone.map((p) => p.projectId)).toContain('p1');
    expect(buckets.quickWins.map((p) => p.projectId)).toContain('p2');
    expect(
      Object.values(buckets)
        .flat()
        .some((p) => p.projectId === 'p3')
    ).toBe(false);
  });
});
