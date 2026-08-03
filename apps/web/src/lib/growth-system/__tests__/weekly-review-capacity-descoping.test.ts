import { describe, expect, it } from 'vitest';
import {
  capacityAdvisoryReasonLine,
  computeLivePlannedStoryPoints,
  isCapacityOverloaded,
  pickVisibleDeScopeCandidates,
} from '../weekly-review-capacity-descoping';
import type { WeeklyReviewCapacityAdvisory } from '@/types/growth-system';

const advisory: WeeklyReviewCapacityAdvisory = {
  softWeeklyCapacityStoryPoints: 10,
  trailingWeeklyAverageStoryPoints: 12,
  recoveryMultiplier: 1,
  marginBuffer: 0.1,
  nextWeekStart: '2026-04-20',
  nextWeekEnd: '2026-04-26',
  scheduledStoryPoints: 12,
  candidates: [
    {
      taskId: 't1',
      title: 'Big',
      size: 8,
      priority: 'P3',
      rolloverCount: 0,
    },
    {
      taskId: 't2',
      title: 'Small',
      size: 3,
      priority: 'P3',
      rolloverCount: 0,
    },
  ],
};

describe('weekly-review-capacity-descoping', () => {
  it('computes live planned with accepted and de-scoped adjustments', () => {
    expect(
      computeLivePlannedStoryPoints({
        advisory,
        acceptedSuggestions: [{ title: 'New', area: 'Ops', size: 5, goalIds: [], projectIds: [] }],
        deScopeDecisions: [{ taskId: 't1', action: 'backlog' }],
        techDebtDecisions: [],
      })
    ).toBe(9);
  });

  it('detects overload', () => {
    expect(isCapacityOverloaded(11, 10)).toBe(true);
    expect(isCapacityOverloaded(10, 10)).toBe(false);
  });

  it('filters visible candidates after decisions', () => {
    expect(
      pickVisibleDeScopeCandidates(advisory, [{ taskId: 't1', action: 'backlog' }], [])
    ).toEqual([advisory.candidates[1]]);
  });

  it('formats recovery reason line', () => {
    expect(capacityAdvisoryReasonLine({ ...advisory, recoveryMultiplier: 0.8 })).toContain(
      'recovery tightened'
    );
  });
});
