import { describe, expect, it } from 'vitest';
import { EXTREME_OVERDUE_DAYS, getDateUrgency } from './project-summary';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const FIXED_NOW_MS = Date.UTC(2026, 6, 27, 12, 0, 0);

function endDateDaysBeforeNow(days: number): string {
  return new Date(FIXED_NOW_MS - days * MS_PER_DAY).toISOString().slice(0, 10);
}

describe('getDateUrgency extreme overdue polish', () => {
  it('uses red overdue pill for 1 day overdue', () => {
    const result = getDateUrgency(endDateDaysBeforeNow(1), { nowMs: FIXED_NOW_MS });
    expect(result?.text).toBe('Overdue by 1 days');
    expect(result?.color).toContain('text-red-600');
    expect(result?.animate).toBe('animate-pulse');
    expect(result?.dimCard).toBe(false);
  });

  it('uses red overdue pill at the 60-day threshold', () => {
    const result = getDateUrgency(endDateDaysBeforeNow(60), { nowMs: FIXED_NOW_MS });
    expect(result?.text).toBe('Overdue by 60 days');
    expect(result?.color).toContain('text-red-600');
    expect(result?.animate).toBe('animate-pulse');
    expect(result?.dimCard).toBe(false);
  });

  it('uses muted long-overdue pill and dimCard beyond 60 days overdue', () => {
    const result = getDateUrgency(endDateDaysBeforeNow(61), { nowMs: FIXED_NOW_MS });
    expect(result?.text).toBe('Long overdue · 61 days');
    expect(result?.color).toContain('text-gray-500');
    expect(result?.animate).toBe('');
    expect(result?.dimCard).toBe(true);
  });

  it('uses long-overdue pill for 134 days overdue', () => {
    const result = getDateUrgency(endDateDaysBeforeNow(134), { nowMs: FIXED_NOW_MS });
    expect(result?.text).toBe('Long overdue · 134 days');
    expect(result?.dimCard).toBe(true);
  });

  it('exports extreme overdue threshold as 60', () => {
    expect(EXTREME_OVERDUE_DAYS).toBe(60);
  });

  it('hides urgency when hideWhenComplete is set', () => {
    const result = getDateUrgency(endDateDaysBeforeNow(90), {
      hideWhenComplete: true,
      nowMs: FIXED_NOW_MS,
    });
    expect(result?.text).toBeNull();
    expect(result?.dimCard).toBe(false);
  });
});
