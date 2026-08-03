import { describe, expect, it } from 'vitest';
import { resolveTodaysStartTemplate } from '@/lib/fitness/todays-scheduled-template';
import type { ScheduledWorkoutDay, WorkoutTemplate } from '@/types/fitness';

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

describe('resolveTodaysStartTemplate', () => {
  it('returns template when workout day has resolvable templateId', () => {
    expect(resolveTodaysStartTemplate(day({ templateId: 'tpl-push' }), templates)).toEqual({
      templateId: 'tpl-push',
      templateName: 'Push day A',
    });
  });

  it('returns null for rest day', () => {
    expect(
      resolveTodaysStartTemplate(day({ dayType: 'rest', templateId: 'tpl-push' }), templates)
    ).toBeNull();
  });

  it('returns null for day_off', () => {
    expect(
      resolveTodaysStartTemplate(day({ dayType: 'day_off', templateId: 'tpl-push' }), templates)
    ).toBeNull();
  });

  it('returns null when templateId is missing', () => {
    expect(resolveTodaysStartTemplate(day({ templateId: null }), templates)).toBeNull();
    expect(resolveTodaysStartTemplate(day({ templateId: undefined }), templates)).toBeNull();
    expect(resolveTodaysStartTemplate(day({ templateId: '' }), templates)).toBeNull();
  });

  it('returns null when templateId is unknown', () => {
    expect(resolveTodaysStartTemplate(day({ templateId: 'missing-tpl' }), templates)).toBeNull();
  });

  it('returns null when day is undefined', () => {
    expect(resolveTodaysStartTemplate(undefined, templates)).toBeNull();
  });
});
