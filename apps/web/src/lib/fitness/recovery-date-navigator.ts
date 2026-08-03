import { addCalendarDays, localCalendarDate } from '@/lib/date/local-calendar';
import type { DailyRecovery } from '@/types/fitness';

export type RecoveryCalendarDay = {
  isoDate: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  isSelected: boolean;
};

function parseIsoDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Clamp an ISO date to maxDate (returns maxDate when iso > max). */
export function clampToMaxDate(isoDate: string, maxDate: string): string {
  return isoDate > maxDate ? maxDate : isoDate;
}

/** Relative pill label for the recovery date navigator. */
export function formatRecoveryNavigatorLabel(isoDate: string, todayIso: string): string {
  if (isoDate === todayIso) return 'Today';

  const yesterday = addCalendarDays(todayIso, -1);
  if (isoDate === yesterday) return 'Yesterday';

  const dt = parseIsoDate(isoDate);
  const todayYear = parseIsoDate(todayIso).getFullYear();
  const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' });
  const day = dt.getDate();

  if (dt.getFullYear() !== todayYear) {
    return `${weekday} ${day}, ${dt.getFullYear()}`;
  }

  return `${weekday} ${day}`;
}

/** Absolute readable date for aria-label (e.g. Wednesday, July 29, 2026). */
export function formatRecoveryNavigatorAriaLabel(isoDate: string): string {
  const dt = parseIsoDate(isoDate);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Gridcell aria-label including optional logged recovery status. */
export function formatRecoveryDayAriaLabel(
  isoDate: string,
  options?: { hasLog?: boolean }
): string {
  const base = formatRecoveryNavigatorAriaLabel(isoDate);
  if (options?.hasLog) {
    return `${base}, recovery logged`;
  }
  return base;
}

/** ISO date span covered by the 42-cell month grid (includes adjacent-month cells). */
export function recoveryCalendarGridRange(
  viewYear: number,
  viewMonth: number
): { startDate: string; endDate: string } {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(viewYear, viewMonth, 1 - startWeekday);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridStart.getDate() + 41);
  return {
    startDate: localCalendarDate(gridStart),
    endDate: localCalendarDate(gridEnd),
  };
}

/** Persisted recovery dates from a paginated list response (skips ephemeral shells). */
export function loggedRecoveryDatesFromPage(rows: DailyRecovery[]): Set<string> {
  const dates = new Set<string>();
  for (const row of rows) {
    if (row.isPersisted === false) continue;
    dates.add(row.date);
  }
  return dates;
}

/** Build a 6-row month grid (42 cells) for the calendar popover. */
export function buildRecoveryMonthGrid(
  viewYear: number,
  viewMonth: number,
  selectedIso: string,
  maxDateIso: string
): RecoveryCalendarDay[] {
  const todayIso = localCalendarDate();
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(viewYear, viewMonth, 1 - startWeekday);

  const cells: RecoveryCalendarDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    const isoDate = localCalendarDate(cellDate);
    cells.push({
      isoDate,
      dayOfMonth: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === viewMonth,
      isToday: isoDate === todayIso,
      isFuture: isoDate > maxDateIso,
      isSelected: isoDate === selectedIso,
    });
  }
  return cells;
}

export function monthYearLabel(viewYear: number, viewMonth: number): string {
  return new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

/** ISO date for the first day of the month containing isoDate. */
export function startOfMonthIso(isoDate: string): string {
  const dt = parseIsoDate(isoDate);
  return localCalendarDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
}

/** View month/year from an ISO date. */
export function viewMonthFromIso(isoDate: string): { year: number; month: number } {
  const dt = parseIsoDate(isoDate);
  return { year: dt.getFullYear(), month: dt.getMonth() };
}

/** Whether the viewed month can navigate forward (any day in month <= maxDate). */
export function canViewNextMonth(viewYear: number, viewMonth: number, maxDateIso: string): boolean {
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const maxDt = parseIsoDate(maxDateIso);
  const maxMonthStart = new Date(maxDt.getFullYear(), maxDt.getMonth(), 1);
  return nextMonthStart <= maxMonthStart;
}

const ARROW_OFFSETS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

/** Move focus among enabled days in a month grid via arrow keys. */
export function moveRecoveryCalendarFocus(
  grid: RecoveryCalendarDay[],
  currentIso: string,
  key: string
): string | null {
  const delta = ARROW_OFFSETS[key];
  if (delta === undefined) return null;

  const currentIndex = grid.findIndex((d) => d.isoDate === currentIso);
  if (currentIndex === -1) return null;

  let nextIndex = currentIndex + delta;
  const step = delta > 0 ? 1 : -1;
  while (nextIndex >= 0 && nextIndex < grid.length) {
    const cell = grid[nextIndex];
    if (!cell.isFuture) return cell.isoDate;
    nextIndex += step;
  }
  return null;
}

/** First/last enabled day in the same ISO week row as currentIso. */
export function weekBoundaryFocus(
  grid: RecoveryCalendarDay[],
  currentIso: string,
  boundary: 'home' | 'end'
): string | null {
  const enabled = grid.filter((d) => !d.isFuture);
  const current = enabled.find((d) => d.isoDate === currentIso);
  if (!current) return enabled[0]?.isoDate ?? null;

  const currentIndexInGrid = grid.findIndex((d) => d.isoDate === currentIso);
  const rowStart = Math.floor(currentIndexInGrid / 7) * 7;
  const rowCells = grid.slice(rowStart, rowStart + 7).filter((d) => !d.isFuture);
  if (rowCells.length === 0) return currentIso;
  return boundary === 'home' ? rowCells[0].isoDate : rowCells[rowCells.length - 1].isoDate;
}
