import { cn } from '@/lib/utils';

/** Muted accent for zero-value stat tile value and icon. */
export const weeklyStatTileZeroAccentClassName = 'text-gray-400 dark:text-gray-500';

const weeklyStatTileActiveShellClassName =
  'border-blue-200/60 bg-gradient-to-br from-white to-blue-50/50 dark:border-blue-900/45 dark:from-gray-800 dark:to-blue-950/25';

const weeklyStatTileHistoricalShellClassName =
  'border-slate-200/90 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/35';

const weeklyStatTileZeroShellClassName =
  'border border-dashed border-gray-300/80 bg-gray-50/80 dark:border-gray-600 dark:bg-gray-800/40';

export function isWeeklyStatTileZero(value: number): boolean {
  return value === 0;
}

export function weeklyStatTileAccentClassName(isZero: boolean, accent: string): string {
  return isZero ? weeklyStatTileZeroAccentClassName : accent;
}

export function weeklyStatTileShellClassName({
  isZero,
  historicalMuted = false,
}: {
  isZero: boolean;
  historicalMuted?: boolean;
}): string {
  if (historicalMuted) {
    return cn(
      'rounded-xl border p-4 text-left transition-colors',
      weeklyStatTileHistoricalShellClassName,
      isZero && 'border-dashed'
    );
  }

  if (isZero) {
    return cn('rounded-xl p-4 text-left transition-colors', weeklyStatTileZeroShellClassName);
  }

  return cn(
    'rounded-xl border p-4 text-left transition-colors',
    weeklyStatTileActiveShellClassName
  );
}
