import { describe, expect, it } from 'vitest';
import { resolveTodaysStripState } from '@/lib/fitness/todays-workout-strip';
import type { ScheduledWorkoutDay, WorkoutSession, WorkoutTemplate } from '@/types/fitness';

const templates: WorkoutTemplate[] = [
  {
    id: 'tpl-push',
    name: 'Push day A',
    split: 'push',
    exerciseIds: ['ex-1'],
    isActive: true,
    userId: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

function day(partial: Partial<ScheduledWorkoutDay>): ScheduledWorkoutDay {
  return {
    date: '2026-07-29',
    userId: 'u1',
    dayType: 'workout',
    status: 'scheduled',
    isOverride: false,
    ...partial,
  };
}

function session(partial: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: 'sess-1',
    userId: 'u1',
    templateId: 'tpl-push',
    sessionDate: '2026-07-29',
    status: 'in_progress',
    notes: null,
    startedAt: '2026-07-29T08:00:00Z',
    completedAt: null,
    createdAt: '2026-07-29T08:00:00Z',
    updatedAt: '2026-07-29T08:00:00Z',
    ...partial,
  };
}

describe('resolveTodaysStripState', () => {
  it('returns loading when isLoading is true', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: 'tpl-push' }),
        templates,
        todaysSessions: [],
        isLoading: true,
      })
    ).toEqual({ mode: 'loading' });
  });

  it('returns ready when workout day has resolvable template', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: 'tpl-push' }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({
      mode: 'ready',
      templateId: 'tpl-push',
      templateName: 'Push day A',
    });
  });

  it('returns rest for rest day', () => {
    expect(
      resolveTodaysStripState({
        day: day({ dayType: 'rest', status: 'rest', templateId: null }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'rest', label: 'Rest day' });
  });

  it('returns rest for day off', () => {
    expect(
      resolveTodaysStripState({
        day: day({ dayType: 'day_off', status: 'excused_off', templateId: null }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'rest', label: 'Day off' });
  });

  it('returns completed when day status is completed', () => {
    expect(
      resolveTodaysStripState({
        day: day({ status: 'completed', templateId: 'tpl-push' }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'completed', templateName: 'Push day A' });
  });

  it('returns completed when today has a completed session', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: 'tpl-push' }),
        templates,
        todaysSessions: [session({ status: 'completed' })],
      })
    ).toEqual({ mode: 'completed', templateName: 'Push day A' });
  });

  it('prioritizes completed over rest', () => {
    expect(
      resolveTodaysStripState({
        day: day({ dayType: 'rest', status: 'completed' }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'completed', templateName: undefined });
  });

  it('prioritizes rest over in_progress session', () => {
    expect(
      resolveTodaysStripState({
        day: day({ dayType: 'rest', status: 'rest' }),
        templates,
        todaysSessions: [session({ status: 'in_progress' })],
      })
    ).toEqual({ mode: 'rest', label: 'Rest day' });
  });

  it('returns in_progress when session is active on workout day', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: 'tpl-push' }),
        templates,
        todaysSessions: [session({ status: 'in_progress', id: 'sess-42' })],
      })
    ).toEqual({
      mode: 'in_progress',
      sessionId: 'sess-42',
      templateName: 'Push day A',
    });
  });

  it('returns workout_unresolved when template is missing', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: null }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'workout_unresolved' });
  });

  it('returns workout_unresolved when template id is unknown', () => {
    expect(
      resolveTodaysStripState({
        day: day({ templateId: 'missing' }),
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'workout_unresolved' });
  });

  it('returns no_schedule when day is undefined', () => {
    expect(
      resolveTodaysStripState({
        day: undefined,
        templates,
        todaysSessions: [],
      })
    ).toEqual({ mode: 'no_schedule' });
  });
});
