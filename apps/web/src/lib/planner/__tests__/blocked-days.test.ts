import { describe, expect, it } from 'vitest';

import type { PlannerDay } from '@/types/planner';

import {
  canClearManualOutOfOffice,
  dayHasScheduledWork,
  isPlannerDayContentEmpty,
  isPlannerPastWeekEmpty,
  nonManualBlockedHint,
  resolveDayBlockToggleAction,
} from '../blocked-days';

function day(partial: Partial<PlannerDay>): PlannerDay {
  return {
    date: '2026-07-28',
    capacityStoryPoints: 3.4,
    scheduledStoryPoints: 0,
    scheduledMinutes: 0,
    loadRatio: 0,
    capacityState: 'healthy',
    oneThingTaskId: null,
    calendarBusyMinutes: 0,
    calendarFreeMinutes: 0,
    lastGeneratedAt: null,
    blocks: [],
    rolloverTasks: [],
    ...partial,
  };
}

describe('resolveDayBlockToggleAction', () => {
  it('returns clear when manual exception exists', () => {
    const d = day({
      isBlocked: true,
      capacityState: 'blocked',
      blockingContexts: [
        {
          id: 'exc-1',
          source: 'manual',
          kind: 'outOfOffice',
          label: 'Out of Office',
          startDate: '2026-07-28',
          endDate: '2026-07-28',
          isManual: true,
        },
      ],
    });
    expect(resolveDayBlockToggleAction(d, '2026-07-28')).toEqual({
      type: 'clear',
      exceptionId: 'exc-1',
    });
  });

  it('returns explain-non-manual when blocked without manual context', () => {
    const d = day({
      isBlocked: true,
      capacityState: 'blocked',
      blockingContexts: [
        {
          id: 'standby-1',
          source: 'standby',
          kind: 'outOfOffice',
          label: 'OOO Standby',
          startDate: '2026-07-28',
          endDate: '2026-07-30',
          isManual: false,
        },
      ],
    });
    expect(resolveDayBlockToggleAction(d, '2026-07-28')).toEqual({
      type: 'explain-non-manual',
      source: 'standby',
      label: 'OOO Standby',
    });
  });

  it('returns create when day is not blocked', () => {
    const d = day({ isBlocked: false });
    expect(resolveDayBlockToggleAction(d, '2026-07-28')).toEqual({ type: 'create' });
  });
});

describe('canClearManualOutOfOffice', () => {
  it('is true only when manual context overlaps date', () => {
    const d = day({
      blockingContexts: [
        {
          id: 'exc-1',
          source: 'manual',
          kind: 'outOfOffice',
          label: 'Out of Office',
          startDate: '2026-07-28',
          endDate: '2026-07-28',
          isManual: true,
        },
      ],
    });
    expect(canClearManualOutOfOffice(d, '2026-07-28')).toBe(true);
    expect(canClearManualOutOfOffice(d, '2026-07-29')).toBe(false);
  });
});

describe('dayHasScheduledWork', () => {
  it('detects blocks or scheduled points', () => {
    expect(dayHasScheduledWork(day({ blocks: [], scheduledStoryPoints: 0 }))).toBe(false);
    expect(dayHasScheduledWork(day({ scheduledStoryPoints: 2 }))).toBe(true);
    expect(
      dayHasScheduledWork(
        day({
          blocks: [
            {
              id: 'b1',
              date: '2026-07-28',
              startAt: '',
              endAt: '',
              durationMinutes: 60,
              taskId: 't1',
              taskTitleSnapshot: 'Task',
              source: 'manual',
              status: 'scheduled',
              storyPointsLoad: 1,
              calendarEventId: null,
              microStepId: null,
              microStepText: null,
              createdAt: '',
              updatedAt: '',
            },
          ],
        })
      )
    ).toBe(true);
  });
});

describe('isPlannerDayContentEmpty', () => {
  it('returns true for healthy day with no blocks, rollovers, or drafts', () => {
    expect(isPlannerDayContentEmpty(day({}))).toBe(true);
    expect(isPlannerDayContentEmpty(day({}), [])).toBe(true);
  });

  it('returns false when day has blocks', () => {
    expect(
      isPlannerDayContentEmpty(
        day({
          blocks: [
            {
              id: 'b1',
              date: '2026-07-28',
              startAt: '',
              endAt: '',
              durationMinutes: 60,
              taskId: 't1',
              taskTitleSnapshot: 'Task',
              source: 'manual',
              status: 'scheduled',
              storyPointsLoad: 1,
              calendarEventId: null,
              microStepId: null,
              microStepText: null,
              createdAt: '',
              updatedAt: '',
            },
          ],
        })
      )
    ).toBe(false);
  });

  it('returns false when day has rollovers', () => {
    expect(
      isPlannerDayContentEmpty(
        day({
          rolloverTasks: [
            {
              rolloverId: 'r1',
              taskId: 't1',
              title: 'Rollover task',
              priority: 'high',
              storyPoints: 2,
              sourceDate: '2026-07-27',
              reason: 'missedScheduledDate',
              badge: 'Rolled Over',
            },
          ],
        })
      )
    ).toBe(false);
  });

  it('returns false when drafts exist for the day', () => {
    expect(
      isPlannerDayContentEmpty(day({}), [
        {
          tempId: 'd1',
          date: '2026-07-28',
          startAt: '',
          endAt: '',
          taskId: 't1',
          taskTitleSnapshot: 'Draft',
          storyPointsLoad: 1,
          reason: null,
        },
      ])
    ).toBe(false);
  });

  it('returns false when day is blocked', () => {
    expect(
      isPlannerDayContentEmpty(
        day({
          isBlocked: true,
          capacityState: 'blocked',
          blockingContexts: [
            {
              id: 'exc-1',
              source: 'manual',
              kind: 'outOfOffice',
              label: 'Out of Office',
              startDate: '2026-07-28',
              endDate: '2026-07-28',
              isManual: true,
            },
          ],
        })
      )
    ).toBe(false);
  });
});

describe('isPlannerPastWeekEmpty', () => {
  const emptyDays = [
    day({ date: '2025-12-22' }),
    day({ date: '2025-12-23' }),
    day({ date: '2025-12-24' }),
  ];

  it('returns true for a fully past week with all content-empty days', () => {
    expect(
      isPlannerPastWeekEmpty({ weekEnd: '2025-12-28', days: emptyDays }, [], '2026-01-01')
    ).toBe(true);
  });

  it('returns false for current or future weeks even when all days are empty', () => {
    const futureDays = [day({ date: '2026-07-27' }), day({ date: '2026-07-28' })];
    expect(
      isPlannerPastWeekEmpty({ weekEnd: '2026-08-02', days: futureDays }, [], '2026-01-01')
    ).toBe(false);
  });

  it('returns false for a past week with scheduled work on any day', () => {
    const daysWithBlock = [
      ...emptyDays.slice(0, 2),
      day({
        date: '2025-12-24',
        blocks: [
          {
            id: 'b1',
            date: '2025-12-24',
            startAt: '',
            endAt: '',
            durationMinutes: 60,
            taskId: 't1',
            taskTitleSnapshot: 'Task',
            source: 'manual',
            status: 'scheduled',
            storyPointsLoad: 1,
            calendarEventId: null,
            microStepId: null,
            microStepText: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
      }),
    ];
    expect(
      isPlannerPastWeekEmpty({ weekEnd: '2025-12-28', days: daysWithBlock }, [], '2026-01-01')
    ).toBe(false);
  });

  it('returns false when drafts exist for any day in a past week', () => {
    expect(
      isPlannerPastWeekEmpty(
        { weekEnd: '2025-12-28', days: emptyDays },
        [
          {
            tempId: 'd1',
            date: '2025-12-23',
            startAt: '',
            endAt: '',
            taskId: 't1',
            taskTitleSnapshot: 'Draft',
            storyPointsLoad: 1,
            reason: null,
          },
        ],
        '2026-01-01'
      )
    ).toBe(false);
  });

  it('returns false for a past week with a blocked day', () => {
    const daysWithBlocked = [
      ...emptyDays.slice(0, 2),
      day({
        date: '2025-12-24',
        isBlocked: true,
        capacityState: 'blocked',
        blockingContexts: [
          {
            id: 'exc-1',
            source: 'manual',
            kind: 'outOfOffice',
            label: 'Out of Office',
            startDate: '2025-12-24',
            endDate: '2025-12-24',
            isManual: true,
          },
        ],
      }),
    ];
    expect(
      isPlannerPastWeekEmpty({ weekEnd: '2025-12-28', days: daysWithBlocked }, [], '2026-01-01')
    ).toBe(false);
  });
});

describe('nonManualBlockedHint', () => {
  it('formats source and label', () => {
    expect(
      nonManualBlockedHint({
        blockingContexts: [
          {
            id: 'v1',
            source: 'voyager',
            kind: 'trip',
            label: 'Tokyo',
            startDate: '2026-07-28',
            endDate: '2026-08-02',
            isManual: false,
          },
        ],
      })
    ).toBe('Blocked by Voyager trip: Tokyo');
  });
});
