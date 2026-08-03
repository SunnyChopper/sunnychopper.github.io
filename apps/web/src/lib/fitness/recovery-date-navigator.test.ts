import { describe, expect, it } from 'vitest';
import {
  buildRecoveryMonthGrid,
  clampToMaxDate,
  formatRecoveryDayAriaLabel,
  formatRecoveryNavigatorLabel,
  loggedRecoveryDatesFromPage,
  moveRecoveryCalendarFocus,
  recoveryCalendarGridRange,
} from '@/lib/fitness/recovery-date-navigator';
import type { DailyRecovery } from '@/types/fitness';

function recoveryRow(date: string, isPersisted = true): DailyRecovery {
  return {
    date,
    userId: 'u1',
    sleepHours: null,
    sleepQuality: null,
    energyLevel: null,
    restingHeartRate: null,
    sorenessLevel: null,
    stressLevel: null,
    bodyWeight: null,
    notes: null,
    recoveryScore: null,
    isPersisted,
    createdAt: '2026-07-29T00:00:00Z',
    updatedAt: '2026-07-29T00:00:00Z',
  };
}

describe('formatRecoveryNavigatorLabel', () => {
  const today = '2026-07-29';

  it('returns Today for today', () => {
    expect(formatRecoveryNavigatorLabel('2026-07-29', today)).toBe('Today');
  });

  it('returns Yesterday for prior day', () => {
    expect(formatRecoveryNavigatorLabel('2026-07-28', today)).toBe('Yesterday');
  });

  it('returns weekday + day for same year', () => {
    expect(formatRecoveryNavigatorLabel('2026-07-27', today)).toBe('Mon 27');
  });

  it('includes year when different calendar year', () => {
    expect(formatRecoveryNavigatorLabel('2025-12-31', today)).toBe('Wed 31, 2025');
  });
});

describe('clampToMaxDate', () => {
  it('returns iso when on or before max', () => {
    expect(clampToMaxDate('2026-07-28', '2026-07-29')).toBe('2026-07-28');
    expect(clampToMaxDate('2026-07-29', '2026-07-29')).toBe('2026-07-29');
  });

  it('clamps future dates to max', () => {
    expect(clampToMaxDate('2026-07-30', '2026-07-29')).toBe('2026-07-29');
  });
});

describe('buildRecoveryMonthGrid', () => {
  it('marks future days relative to maxDate', () => {
    const grid = buildRecoveryMonthGrid(2026, 6, '2026-07-29', '2026-07-29');
    const july30 = grid.find((d) => d.isoDate === '2026-07-30');
    expect(july30?.isFuture).toBe(true);
    const july29 = grid.find((d) => d.isoDate === '2026-07-29');
    expect(july29?.isFuture).toBe(false);
  });
});

describe('moveRecoveryCalendarFocus', () => {
  it('moves to previous enabled day with ArrowLeft', () => {
    const grid = buildRecoveryMonthGrid(2026, 6, '2026-07-29', '2026-07-29');
    const next = moveRecoveryCalendarFocus(grid, '2026-07-29', 'ArrowLeft');
    expect(next).toBe('2026-07-28');
  });
});

describe('recoveryCalendarGridRange', () => {
  it('returns the first and last ISO dates in the 42-cell grid', () => {
    const { startDate, endDate } = recoveryCalendarGridRange(2026, 6);
    expect(startDate).toBe('2026-06-28');
    expect(endDate).toBe('2026-08-08');
  });
});

describe('loggedRecoveryDatesFromPage', () => {
  it('collects persisted dates and skips ephemeral shells', () => {
    const dates = loggedRecoveryDatesFromPage([
      recoveryRow('2026-07-27'),
      recoveryRow('2026-07-28', false),
      recoveryRow('2026-07-29'),
    ]);
    expect(dates).toEqual(new Set(['2026-07-27', '2026-07-29']));
  });
});

describe('formatRecoveryDayAriaLabel', () => {
  it('appends recovery logged when hasLog is true', () => {
    expect(formatRecoveryDayAriaLabel('2026-07-27', { hasLog: true })).toMatch(/recovery logged$/);
    expect(formatRecoveryDayAriaLabel('2026-07-27')).not.toMatch(/recovery logged/);
  });
});
