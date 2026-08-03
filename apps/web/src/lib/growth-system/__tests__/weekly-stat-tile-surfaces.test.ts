import { describe, expect, it } from 'vitest';

import {
  isWeeklyStatTileZero,
  weeklyStatTileAccentClassName,
  weeklyStatTileShellClassName,
  weeklyStatTileZeroAccentClassName,
} from '@/lib/growth-system/weekly-stat-tile-surfaces';

describe('weekly-stat-tile-surfaces', () => {
  it('detects zero values strictly', () => {
    expect(isWeeklyStatTileZero(0)).toBe(true);
    expect(isWeeklyStatTileZero(1)).toBe(false);
    expect(isWeeklyStatTileZero(-1)).toBe(false);
  });

  it('mutes accent classes for zero tiles', () => {
    expect(weeklyStatTileAccentClassName(true, 'text-violet-500')).toBe(
      weeklyStatTileZeroAccentClassName
    );
    expect(weeklyStatTileAccentClassName(false, 'text-violet-500')).toBe('text-violet-500');
  });

  it('uses dashed shell for active zero tiles', () => {
    const shell = weeklyStatTileShellClassName({ isZero: true });
    expect(shell).toContain('border-dashed');
    expect(shell).toContain('bg-gray-50/80');
    expect(shell).not.toContain('border-blue-200');
  });

  it('keeps solid active shell for non-zero tiles', () => {
    const shell = weeklyStatTileShellClassName({ isZero: false });
    expect(shell).toContain('border-blue-200/60');
    expect(shell).not.toContain('border-dashed');
  });

  it('composes historical mute with dashed border for zero tiles', () => {
    const shell = weeklyStatTileShellClassName({ isZero: true, historicalMuted: true });
    expect(shell).toContain('border-slate-200/90');
    expect(shell).toContain('border-dashed');
  });

  it('keeps historical shell without dashed for non-zero tiles', () => {
    const shell = weeklyStatTileShellClassName({ isZero: false, historicalMuted: true });
    expect(shell).toContain('border-slate-200/90');
    expect(shell).not.toContain('border-dashed');
  });
});
