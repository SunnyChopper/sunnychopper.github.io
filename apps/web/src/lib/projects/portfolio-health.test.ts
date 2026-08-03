import { describe, expect, it } from 'vitest';
import type { Project } from '@/types/growth-system';
import type { ProjectHealthSummary } from '@/types/project-health';
import { getProjectDisplayModel } from '@/utils/project-summary';
import {
  averagePortfolioHealthScore,
  countPortfolioBuckets,
  isOpenProjectStatus,
  isProjectOverdueForPortfolio,
  resolvePortfolioHealthScore,
} from './portfolio-health';

const NOW = Date.parse('2026-07-27T12:00:00.000Z');

function mockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Founder OS',
    description: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Planning',
    impact: 3,
    startDate: '2026-03-01',
    targetEndDate: '2026-04-30',
    actualEndDate: null,
    isStale: true,
    notes: null,
    userId: 'u1',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

const resolveDisplay = (project: Project) => getProjectDisplayModel(project, 0, 0, []);

describe('isOpenProjectStatus', () => {
  it('treats Planning, Active, and On Hold as open', () => {
    expect(isOpenProjectStatus(mockProject({ status: 'Planning' }))).toBe(true);
    expect(isOpenProjectStatus(mockProject({ status: 'Active' }))).toBe(true);
    expect(isOpenProjectStatus(mockProject({ status: 'On Hold' }))).toBe(true);
    expect(isOpenProjectStatus(mockProject({ status: 'Completed' }))).toBe(false);
  });
});

describe('isProjectOverdueForPortfolio', () => {
  it('returns true when target end date is in the past', () => {
    expect(
      isProjectOverdueForPortfolio(mockProject({ targetEndDate: '2026-07-01' }), false, NOW)
    ).toBe(true);
  });

  it('returns false when work is complete', () => {
    expect(
      isProjectOverdueForPortfolio(mockProject({ targetEndDate: '2026-07-01' }), true, NOW)
    ).toBe(false);
  });
});

describe('countPortfolioBuckets', () => {
  it('counts active, planning, stale, and overdue across the portfolio', () => {
    const projects = [
      mockProject({ id: 'a', status: 'Active', isStale: false, targetEndDate: '2026-08-01' }),
      mockProject({ id: 'b', status: 'Planning', isStale: true, targetEndDate: '2026-07-01' }),
      mockProject({ id: 'c', status: 'Completed', isStale: false, targetEndDate: '2026-07-01' }),
    ];

    expect(countPortfolioBuckets(projects, resolveDisplay, NOW)).toEqual({
      active: 1,
      planning: 1,
      stale: 1,
      overdue: 1,
    });
  });

  it('returns zeros for an empty portfolio', () => {
    expect(countPortfolioBuckets([], resolveDisplay, NOW)).toEqual({
      active: 0,
      planning: 0,
      stale: 0,
      overdue: 0,
    });
  });
});

describe('averagePortfolioHealthScore', () => {
  it('returns rounded mean of finite scores', () => {
    expect(averagePortfolioHealthScore([80, 60, null])).toBe(70);
  });

  it('returns null when no scores are available', () => {
    expect(averagePortfolioHealthScore([null, undefined])).toBeNull();
  });
});

describe('resolvePortfolioHealthScore', () => {
  it('averages health scores for open projects using map then cached project score', () => {
    const projects = [
      mockProject({ id: 'open-a', status: 'Active' }),
      mockProject({ id: 'open-b', status: 'On Hold', healthScore: 50 }),
      mockProject({ id: 'done', status: 'Completed', healthScore: 10 }),
    ];
    const healthMap = new Map<string, ProjectHealthSummary>([
      [
        'open-a',
        {
          healthScore: 90,
          taskCount: 2,
          completedTaskCount: 1,
          percentComplete: 50,
        },
      ],
    ]);

    expect(resolvePortfolioHealthScore(projects, healthMap)).toBe(70);
  });
});
