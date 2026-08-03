import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays } from 'lucide-react';

import { isPlannerPastWeekEmpty } from '@/lib/planner/blocked-days';
import {
  plannerPastWeekEmptyClassName,
  plannerPastWeekEmptyTextClassName,
} from '@/lib/planner/planner-surfaces';
import { todayISOLocal } from '@/lib/planner/week';
import type { PlannerProposedBlock, PlannerRolloverAction, PlannerWeek } from '@/types/planner';
import type { Priority } from '@/types/growth-system';

import { PlannerDayColumn } from './PlannerDayColumn';

export interface PlannerWeekBoardProps {
  week: PlannerWeek;
  focusDate?: string;
  onSelectDay?: (date: string) => void;
  onToggleDayBlocked?: (date: string) => void;
  toggleBlockedPendingDate?: string | null;
  draftBlocks?: PlannerProposedBlock[];
  disableRealBlockDrag?: boolean;
  onDiscardDraft?: (tempId: string) => void;
  onRolloverAction?: (rolloverId: string, action: PlannerRolloverAction) => void;
  rolloverPendingId?: string | null;
  rolloverPendingAction?: PlannerRolloverAction | null;
  priorityByTaskId?: ReadonlyMap<string, Priority>;
}

function resolveInitialFocusedIndex(
  week: PlannerWeek,
  focusDate: string | undefined,
  today: string
) {
  if (focusDate) {
    const focusIdx = week.days.findIndex((day) => day.date === focusDate);
    if (focusIdx >= 0) return focusIdx;
  }
  const todayIdx = week.days.findIndex((day) => day.date === today);
  return todayIdx >= 0 ? todayIdx : 0;
}

export function PlannerWeekBoard({
  week,
  focusDate,
  onSelectDay,
  onToggleDayBlocked,
  toggleBlockedPendingDate,
  draftBlocks,
  disableRealBlockDrag,
  onDiscardDraft,
  onRolloverAction,
  rolloverPendingId,
  rolloverPendingAction,
  priorityByTaskId,
}: PlannerWeekBoardProps) {
  const today = todayISOLocal();
  const showPastWeekEmpty = useMemo(
    () => isPlannerPastWeekEmpty(week, draftBlocks ?? [], today),
    [week, draftBlocks, today]
  );
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const initialFocusedIndex = useMemo(
    () => resolveInitialFocusedIndex(week, focusDate, today),
    [week, focusDate, today]
  );

  const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);

  useEffect(() => {
    setFocusedIndex(initialFocusedIndex);
  }, [initialFocusedIndex]);

  const handlePlanDayHeaderKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const dayCount = week.days.length;
      const lastIndex = dayCount - 1;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (index < lastIndex) {
            const next = index + 1;
            setFocusedIndex(next);
            headerRefs.current[next]?.focus();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) {
            const prev = index - 1;
            setFocusedIndex(prev);
            headerRefs.current[prev]?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          headerRefs.current[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(lastIndex);
          headerRefs.current[lastIndex]?.focus();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelectDay?.(week.days[index].date);
          break;
        default:
          break;
      }
    },
    [week.days, onSelectDay]
  );

  if (showPastWeekEmpty) {
    return (
      <div
        role="status"
        aria-label="No planned work this week"
        className={plannerPastWeekEmptyClassName}
      >
        <CalendarDays className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden />
        <p className={plannerPastWeekEmptyTextClassName}>No planned work this week</p>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Week board days"
      className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-7 lg:overflow-visible"
    >
      {week.days.map((day, index) => (
        <PlannerDayColumn
          key={day.date}
          day={day}
          isFocused={focusDate === day.date}
          isToday={today === day.date}
          onSelect={onSelectDay}
          onToggleBlocked={onToggleDayBlocked}
          toggleBlockedPending={toggleBlockedPendingDate === day.date}
          draftBlocks={draftBlocks}
          disableRealBlockDrag={disableRealBlockDrag}
          onDiscardDraft={onDiscardDraft}
          onRolloverAction={onRolloverAction}
          rolloverPendingId={rolloverPendingId}
          rolloverPendingAction={rolloverPendingAction}
          planDayHeaderRef={(el) => {
            headerRefs.current[index] = el;
          }}
          planDayHeaderTabIndex={focusedIndex === index ? 0 : -1}
          onPlanDayHeaderKeyDown={(e) => handlePlanDayHeaderKeyDown(e, index)}
          onPlanDayHeaderFocus={() => setFocusedIndex(index)}
          priorityByTaskId={priorityByTaskId}
        />
      ))}
    </div>
  );
}
