import { describe, expect, it } from 'vitest';
import type { Project } from '@/types/growth-system';
import {
  computeProjectStaleFromFields,
  getProjectDisplayModel,
  isIsoDateBeforeTodayUtc,
  isProjectStaleForDisplay,
  resolveProjectBadgeStatus,
} from './project-summary';

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

describe('isIsoDateBeforeTodayUtc', () => {
  it('compares calendar dates in UTC', () => {
    const today = new Date('2026-07-28T15:00:00.000Z');
    expect(isIsoDateBeforeTodayUtc('2026-07-27', today)).toBe(true);
    expect(isIsoDateBeforeTodayUtc('2026-07-28', today)).toBe(false);
    expect(isIsoDateBeforeTodayUtc('2026-07-29', today)).toBe(false);
  });
});

describe('computeProjectStaleFromFields', () => {
  it('returns true for Planning with past target end', () => {
    expect(
      computeProjectStaleFromFields({
        status: 'Planning',
        targetEndDate: '2026-03-16',
      })
    ).toBe(true);
  });

  it('returns false for Active even when past target end', () => {
    expect(
      computeProjectStaleFromFields({
        status: 'Active',
        targetEndDate: '2026-03-16',
      })
    ).toBe(false);
  });
});

describe('isProjectStaleForDisplay', () => {
  it('returns true when backend marks project stale', () => {
    expect(isProjectStaleForDisplay(mockProject(), false)).toBe(true);
  });

  it('falls back to field mirror when isStale is omitted', () => {
    expect(
      isProjectStaleForDisplay(
        mockProject({ isStale: undefined, targetEndDate: '2026-03-16' }),
        false
      )
    ).toBe(true);
  });

  it('suppresses stale when work is complete', () => {
    expect(isProjectStaleForDisplay(mockProject(), true)).toBe(false);
  });

  it('suppresses stale for cancelled projects', () => {
    expect(isProjectStaleForDisplay(mockProject({ status: 'Cancelled' }), false)).toBe(false);
  });

  it('suppresses stale for archived projects', () => {
    expect(isProjectStaleForDisplay(mockProject({ status: 'Archived' }), false)).toBe(false);
  });
});

describe('getProjectDisplayModel', () => {
  it('includes isStale from backend flag', () => {
    const display = getProjectDisplayModel(mockProject(), 0, 0, []);
    expect(display.isStale).toBe(true);
    expect(display.effectiveStatus).toBe('Planning');
  });
});

describe('resolveProjectBadgeStatus', () => {
  it('returns Stale when display marks stale', () => {
    expect(
      resolveProjectBadgeStatus(mockProject(), {
        progressPercent: 0,
        isWorkComplete: false,
        effectiveStatus: 'Planning',
        isStale: true,
      })
    ).toBe('Stale');
  });

  it('returns Stale without display when project is stale', () => {
    expect(
      resolveProjectBadgeStatus(mockProject({ isStale: true, targetEndDate: '2026-03-16' }))
    ).toBe('Stale');
  });

  it('returns Planning when not stale', () => {
    expect(
      resolveProjectBadgeStatus(mockProject({ isStale: false, targetEndDate: '2026-12-31' }))
    ).toBe('Planning');
  });
});
