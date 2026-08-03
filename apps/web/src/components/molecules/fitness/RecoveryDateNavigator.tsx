import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addCalendarDays, localCalendarDate } from '@/lib/date/local-calendar';
import {
  fitnessRecoveryDateCapsuleClassName,
  fitnessRecoveryDateCapsuleControlClassName,
} from '@/lib/fitness/fitness-surfaces';
import {
  buildRecoveryMonthGrid,
  canViewNextMonth,
  clampToMaxDate,
  formatRecoveryDayAriaLabel,
  formatRecoveryNavigatorAriaLabel,
  formatRecoveryNavigatorLabel,
  loggedRecoveryDatesFromPage,
  monthYearLabel,
  moveRecoveryCalendarFocus,
  recoveryCalendarGridRange,
  viewMonthFromIso,
  weekBoundaryFocus,
} from '@/lib/fitness/recovery-date-navigator';
import { useFitnessRecoveryRange } from '@/hooks/useFitness';
import { cn } from '@/lib/utils';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type RecoveryDateNavigatorProps = {
  value: string;
  onChange: (isoDate: string) => void;
  maxDate?: string;
  className?: string;
};

export function RecoveryDateNavigator({
  value,
  onChange,
  maxDate = localCalendarDate(),
  className,
}: RecoveryDateNavigatorProps) {
  const today = localCalendarDate();
  const popoverId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelButtonRef = useRef<HTMLButtonElement>(null);
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const initialView = viewMonthFromIso(value);
  const [viewYear, setViewYear] = useState(initialView.year);
  const [viewMonth, setViewMonth] = useState(initialView.month);
  const [focusIso, setFocusIso] = useState(value);

  const canGoForward = value < maxDate;
  const label = formatRecoveryNavigatorLabel(value, today);
  const ariaDate = formatRecoveryNavigatorAriaLabel(value);

  const grid = useMemo(
    () => buildRecoveryMonthGrid(viewYear, viewMonth, value, maxDate),
    [viewYear, viewMonth, value, maxDate]
  );

  const { startDate: gridStartDate, endDate: gridEndDate } = useMemo(
    () => recoveryCalendarGridRange(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const { data: recoveryRangeRes } = useFitnessRecoveryRange(gridStartDate, gridEndDate, {
    enabled: isOpen,
  });

  const loggedDates = useMemo(() => {
    const rows =
      recoveryRangeRes?.success && recoveryRangeRes.data?.data ? recoveryRangeRes.data.data : [];
    return loggedRecoveryDatesFromPage(rows);
  }, [recoveryRangeRes]);

  const canNextMonth = canViewNextMonth(viewYear, viewMonth, maxDate);

  useEffect(() => {
    if (!isOpen) return;
    const focusTarget = dayButtonRefs.current[focusIso];
    focusTarget?.focus();
  }, [isOpen, focusIso, viewYear, viewMonth]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        labelButtonRef.current?.focus();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        labelButtonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const openPopover = () => {
    const view = viewMonthFromIso(value);
    setViewYear(view.year);
    setViewMonth(view.month);
    setFocusIso(value);
    setIsOpen(true);
  };

  const selectDate = (isoDate: string) => {
    const clamped = clampToMaxDate(isoDate, maxDate);
    onChange(clamped);
    setIsOpen(false);
    labelButtonRef.current?.focus();
  };

  const handleGridKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;

    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      selectDate(focusIso);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      const next = weekBoundaryFocus(grid, focusIso, 'home');
      if (next) setFocusIso(next);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      const next = weekBoundaryFocus(grid, focusIso, 'end');
      if (next) setFocusIso(next);
      return;
    }

    const next = moveRecoveryCalendarFocus(grid, focusIso, key);
    if (next) {
      event.preventDefault();
      setFocusIso(next);
    }
  };

  const goPrevMonth = () => {
    const dt = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
  };

  const goNextMonth = () => {
    if (!canNextMonth) return;
    const dt = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
  };

  return (
    <div ref={containerRef} className={cn(fitnessRecoveryDateCapsuleClassName, className)}>
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => onChange(addCalendarDays(value, -1))}
        className={fitnessRecoveryDateCapsuleControlClassName}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <button
        ref={labelButtonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={`Select date, ${ariaDate}`}
        onClick={() => (isOpen ? setIsOpen(false) : openPopover())}
        className={cn(
          fitnessRecoveryDateCapsuleControlClassName,
          'min-w-[5.5rem] px-2 py-1.5 text-center text-sm font-medium text-gray-900 dark:text-white'
        )}
      >
        {label}
      </button>

      <button
        type="button"
        aria-label="Next day"
        disabled={!canGoForward}
        onClick={() => canGoForward && onChange(addCalendarDays(value, 1))}
        className={cn(fitnessRecoveryDateCapsuleControlClassName, 'disabled:opacity-30')}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Choose recovery date"
          className="absolute right-0 top-full z-50 mt-2 w-[17.5rem] rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900"
          onKeyDown={handleGridKeyDown}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={goPrevMonth}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {monthYearLabel(viewYear, viewMonth)}
            </span>
            <button
              type="button"
              aria-label="Next month"
              disabled={!canNextMonth}
              onClick={goNextMonth}
              className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar days">
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                role="columnheader"
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}

            {grid.map((cell) => {
              const isFocused = focusIso === cell.isoDate;
              const tabIndex = isFocused ? 0 : -1;
              const hasLog = loggedDates.has(cell.isoDate);

              return (
                <button
                  key={cell.isoDate}
                  ref={(node) => {
                    dayButtonRefs.current[cell.isoDate] = node;
                  }}
                  type="button"
                  role="gridcell"
                  tabIndex={tabIndex}
                  disabled={cell.isFuture}
                  aria-label={formatRecoveryDayAriaLabel(cell.isoDate, { hasLog })}
                  aria-selected={cell.isSelected}
                  aria-current={cell.isToday ? 'date' : undefined}
                  onClick={() => !cell.isFuture && selectDate(cell.isoDate)}
                  onFocus={() => setFocusIso(cell.isoDate)}
                  onKeyDown={handleGridKeyDown}
                  className={cn(
                    'flex h-8 w-8 flex-col items-center justify-center gap-0.5 rounded-md text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                    !cell.isCurrentMonth && 'text-gray-400 dark:text-gray-500',
                    cell.isCurrentMonth && 'text-gray-900 dark:text-gray-100',
                    cell.isSelected && 'bg-blue-600 font-semibold text-white dark:bg-blue-500',
                    cell.isToday && !cell.isSelected && 'ring-1 ring-blue-500 dark:ring-blue-400',
                    cell.isFuture && 'cursor-not-allowed opacity-30',
                    !cell.isFuture && !cell.isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <span>{cell.dayOfMonth}</span>
                  {hasLog ? (
                    <span
                      data-testid={`recovery-log-dot-${cell.isoDate}`}
                      aria-hidden="true"
                      className={cn(
                        'h-1 w-1 rounded-full',
                        cell.isSelected
                          ? 'bg-white/90 dark:bg-white/90'
                          : 'bg-blue-500 dark:bg-blue-400'
                      )}
                    />
                  ) : (
                    <span aria-hidden="true" className="h-1 w-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
