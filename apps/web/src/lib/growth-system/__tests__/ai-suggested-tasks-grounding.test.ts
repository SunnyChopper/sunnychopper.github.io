import { describe, expect, it } from 'vitest';

import {
  buildWhyThisText,
  formatCriteriaGrounding,
  formatVelocityGrounding,
  primaryGoalId,
  stripSharedGoalRationale,
  unanimousGoalId,
} from '@/lib/growth-system/ai-suggested-tasks-grounding';
import type { SuccessCriterion, WeeklyReviewSuggestedTask } from '@/types/growth-system';

function suggestion(overrides: Partial<WeeklyReviewSuggestedTask> = {}): WeeklyReviewSuggestedTask {
  return {
    title: 'Task',
    rationale: 'Rationale',
    goalIds: [],
    projectIds: [],
    ...overrides,
  };
}

describe('primaryGoalId', () => {
  it('returns first goal id', () => {
    expect(primaryGoalId({ goalIds: ['g1', 'g2'] })).toBe('g1');
  });

  it('returns null for empty or blank ids', () => {
    expect(primaryGoalId({ goalIds: [] })).toBeNull();
    expect(primaryGoalId({ goalIds: ['  '] })).toBeNull();
  });
});

describe('unanimousGoalId', () => {
  it('returns shared id when all suggestions match', () => {
    const items = [
      suggestion({ goalIds: ['g1'] }),
      suggestion({ goalIds: ['g1', 'g2'] }),
      suggestion({ goalIds: ['g1'] }),
    ];
    expect(unanimousGoalId(items)).toBe('g1');
  });

  it('returns null when goals differ or missing', () => {
    expect(
      unanimousGoalId([suggestion({ goalIds: ['g1'] }), suggestion({ goalIds: ['g2'] })])
    ).toBeNull();
    expect(unanimousGoalId([suggestion({ goalIds: [] })])).toBeNull();
    expect(unanimousGoalId([])).toBeNull();
  });
});

describe('stripSharedGoalRationale', () => {
  it('removes boilerplate related-to-goal phrasing', () => {
    const rationale =
      "This task is related to the goal 'Hitting the Cadence' and is a high-priority task.";
    expect(stripSharedGoalRationale(rationale, 'Hitting the Cadence')).toBe('');
  });

  it('keeps unique content after stripping', () => {
    const rationale =
      "This task is related to the goal 'Hitting the Cadence' and is a high-priority task. Unblocks weekly planning.";
    expect(stripSharedGoalRationale(rationale, 'Hitting the Cadence')).toBe(
      'Unblocks weekly planning.'
    );
  });
});

describe('formatVelocityGrounding', () => {
  it('combines trend and recent points', () => {
    const line = formatVelocityGrounding('accelerating', [
      { weekStart: '2026-07-14', storyPointsCompleted: 8, tasksCompleted: 3 },
      { weekStart: '2026-07-21', storyPointsCompleted: 12, tasksCompleted: 4 },
    ]);
    expect(line).toBe('Velocity is accelerating. Recent weeks: 8 pts, 12 pts.');
  });

  it('returns null when no data', () => {
    expect(formatVelocityGrounding(undefined, [])).toBeNull();
  });
});

describe('formatCriteriaGrounding', () => {
  const criteria: SuccessCriterion[] = [
    {
      id: 'c1',
      description: 'Ship weekly review polish',
      isCompleted: false,
      completedAt: null,
      linkedMetricId: null,
      linkedTaskId: null,
      targetDate: null,
      order: 0,
    },
    {
      id: 'c2',
      description: 'Done criterion',
      isCompleted: true,
      completedAt: '2026-07-01',
      linkedMetricId: null,
      linkedTaskId: null,
      targetDate: null,
      order: 1,
    },
  ];

  it('returns incomplete criteria descriptions', () => {
    expect(formatCriteriaGrounding(criteria)).toBe('Open criterion: Ship weekly review polish');
  });
});

describe('buildWhyThisText', () => {
  it('prefers criteria over velocity', () => {
    const text = buildWhyThisText({
      goalTitle: 'Hitting the Cadence',
      criteria: [
        {
          id: 'c1',
          description: 'Complete P2 goals',
          isCompleted: false,
          completedAt: null,
          linkedMetricId: null,
          linkedTaskId: null,
          targetDate: null,
          order: 0,
        },
      ],
      velocityTrend: 'stable',
      velocityData: [{ weekStart: '2026-07-21', storyPointsCompleted: 5, tasksCompleted: 2 }],
    });
    expect(text).toContain('Open criterion: Complete P2 goals');
    expect(text).toContain('Velocity is stable');
  });

  it('falls back to goal-linked sprint planning line', () => {
    expect(
      buildWhyThisText({
        goalTitle: 'Hitting the Cadence',
      })
    ).toBe('Linked to "Hitting the Cadence" for this week\'s sprint planning.');
  });
});
