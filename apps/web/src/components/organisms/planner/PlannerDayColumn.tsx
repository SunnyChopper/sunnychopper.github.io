import { useDroppable } from '@dnd-kit/core';
import { CalendarDays } from 'lucide-react';
import type { KeyboardEvent, MouseEvent, Ref } from 'react';

import {
  blockingLabel,
  blockingOverlayEmoji,
  canClearManualOutOfOffice,
  isPlannerDayBlocked,
  isPlannerDayContentEmpty,
  nonManualBlockedHint,
} from '@/lib/planner/blocked-days';
import { proposedBlockToPlannerBlock } from '@/lib/planner/draft';
import { lookupTaskPriority } from '@/lib/planner/priority-by-task-id';
import {
  plannerEmptyDayIconClassName,
  plannerEmptyDaySlotClassName,
  plannerTodayColumnBgClassName,
  plannerTodayColumnBorderClassName,
  plannerTodayColumnRingClassName,
} from '@/lib/planner/planner-surfaces';
import type { PlannerDay, PlannerProposedBlock, PlannerRolloverAction } from '@/types/planner';
import type { Priority } from '@/types/growth-system';

import { PlannerBlockCard } from './PlannerBlockCard';
import { PlannerCapacityMeter } from './PlannerCapacityMeter';
import { RolloverTaskCard } from './RolloverTaskCard';

export interface PlannerDayColumnProps {
  day: PlannerDay;
  isFocused?: boolean;
  isToday?: boolean;
  onSelect?: (date: string) => void;
  onToggleBlocked?: (date: string) => void;
  toggleBlockedPending?: boolean;
  draftBlocks?: PlannerProposedBlock[];
  disableRealBlockDrag?: boolean;
  onDiscardDraft?: (tempId: string) => void;
  onRolloverAction?: (rolloverId: string, action: PlannerRolloverAction) => void;
  rolloverPendingId?: string | null;
  rolloverPendingAction?: PlannerRolloverAction | null;
  planDayHeaderRef?: Ref<HTMLButtonElement>;
  planDayHeaderTabIndex?: number;
  onPlanDayHeaderKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onPlanDayHeaderFocus?: () => void;
  priorityByTaskId?: ReadonlyMap<string, Priority>;
}

export function PlannerDayColumn({
  day,
  isFocused,
  isToday,
  onSelect,
  onToggleBlocked,
  toggleBlockedPending,
  draftBlocks,
  disableRealBlockDrag,
  onDiscardDraft,
  onRolloverAction,
  rolloverPendingId,
  rolloverPendingAction,
  planDayHeaderRef,
  planDayHeaderTabIndex = -1,
  onPlanDayHeaderKeyDown,
  onPlanDayHeaderFocus,
  priorityByTaskId,
}: PlannerDayColumnProps) {
  const blocked = isPlannerDayBlocked(day);
  const canClearManual = canClearManualOutOfOffice(day, day.date);
  const nonManualBlocked = blocked && !canClearManual;
  const rollovers = day.rolloverTasks ?? [];
  const dayDrafts = (draftBlocks ?? []).filter((b) => b.date === day.date);
  const isContentEmpty = isPlannerDayContentEmpty(day, draftBlocks ?? []);
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.date}`,
    disabled: blocked,
  });

  const border = blocked
    ? 'border-slate-500/50'
    : day.capacityState === 'overloaded'
      ? 'border-red-400/70 dark:border-red-600'
      : day.capacityState === 'warning'
        ? 'border-amber-400/70 dark:border-amber-600'
        : isFocused
          ? 'border-blue-500'
          : isToday
            ? plannerTodayColumnBorderClassName
            : 'border-gray-200 dark:border-white/10';

  const columnBg = blocked
    ? 'bg-slate-100 dark:bg-slate-900/70'
    : isToday
      ? plannerTodayColumnBgClassName
      : 'bg-gray-50 dark:bg-gray-900/40';

  const weekdayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
  });

  const handlePlanDayClick = () => onSelect?.(day.date);

  const handleOooClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (nonManualBlocked) return;
    onToggleBlocked?.(day.date);
  };

  const oooTitle = canClearManual
    ? 'Clear Out of Office for this day'
    : nonManualBlocked
      ? nonManualBlockedHint(day)
      : 'Mark this day Out of Office';

  const planDayAriaLabel = `Plan day ${weekdayLabel} ${day.date.slice(5)}${isToday ? ', today' : ''}`;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex min-h-[200px] w-full min-w-[120px] flex-1 flex-col rounded-xl border-2 p-2 text-left transition lg:min-w-0 ${columnBg} ${
        isFocused ? 'ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10' : ''
      } ${isToday && !isFocused ? plannerTodayColumnRingClassName : ''} ${border} ${
        !blocked && isOver ? 'ring-2 ring-blue-400' : ''
      } ${!blocked ? 'hover:border-gray-300 dark:hover:border-white/20' : ''}`}
    >
      {blocked ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-200/60 dark:bg-slate-950/45"
          aria-hidden
        >
          <span className="rounded-md bg-slate-700/90 px-2 py-1 text-[10px] font-medium text-white dark:bg-slate-800/90 dark:text-slate-200">
            {blockingLabel(day)} {blockingOverlayEmoji(day)}
          </span>
        </div>
      ) : null}

      <div className="relative z-20 mb-2 flex flex-col gap-1">
        <button
          ref={planDayHeaderRef}
          type="button"
          tabIndex={planDayHeaderTabIndex}
          onClick={handlePlanDayClick}
          onKeyDown={onPlanDayHeaderKeyDown}
          onFocus={onPlanDayHeaderFocus}
          aria-label={planDayAriaLabel}
          className="w-full cursor-pointer rounded-md text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {weekdayLabel}
          </div>
          <div
            className={`text-sm font-bold ${
              isFocused ? 'text-blue-600 dark:text-blue-300' : 'text-gray-900 dark:text-white'
            }`}
          >
            {day.date.slice(5)}
          </div>
          {isToday ? (
            <span className="mt-0.5 inline-block rounded-full bg-blue-100 px-1.5 text-[9px] font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              Today
            </span>
          ) : null}
          <PlannerCapacityMeter
            loadRatio={day.loadRatio}
            capacityState={day.capacityState}
            scheduledPoints={day.scheduledStoryPoints}
            capacityPoints={day.capacityStoryPoints}
            variant={isContentEmpty ? 'empty' : 'default'}
            className="mt-2"
          />
        </button>

        {onToggleBlocked && canClearManual ? (
          <button
            type="button"
            className="w-full rounded-md border border-blue-300/60 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            onClick={handleOooClick}
            disabled={toggleBlockedPending}
            title={oooTitle}
            aria-pressed={blocked}
            aria-label={`Clear Out of Office for ${day.date}`}
          >
            Clear Out of Office
          </button>
        ) : null}

        {onToggleBlocked && !blocked ? (
          <button
            type="button"
            className="mx-auto rounded-md px-1.5 py-0.5 text-[9px] font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            onClick={handleOooClick}
            disabled={toggleBlockedPending}
            title={oooTitle}
            aria-label={`Mark ${day.date} Out of Office`}
          >
            Mark OOO
          </button>
        ) : null}

        {nonManualBlocked ? (
          <span className="px-1 text-center text-[9px] font-medium leading-tight text-slate-500 dark:text-slate-400">
            {nonManualBlockedHint(day)}
          </span>
        ) : null}
      </div>

      <div
        role="presentation"
        onClick={handlePlanDayClick}
        className="relative z-0 flex min-h-0 flex-1 cursor-pointer flex-col"
      >
        {isContentEmpty ? (
          <div className={plannerEmptyDaySlotClassName}>
            <CalendarDays className={plannerEmptyDayIconClassName} aria-hidden />
            <span className="sr-only">No scheduled work</span>
          </div>
        ) : (
          <div className="flex min-h-[120px] flex-1 flex-col gap-3">
            {rollovers.map((r) => (
              <RolloverTaskCard
                key={r.rolloverId}
                task={r}
                disabled={!onRolloverAction || blocked}
                pendingAction={
                  rolloverPendingId === r.rolloverId ? (rolloverPendingAction ?? null) : null
                }
                onAction={(id, action) => onRolloverAction?.(id, action)}
              />
            ))}
            {day.blocks.map((b) => (
              <PlannerBlockCard
                key={b.id}
                block={b}
                priority={lookupTaskPriority(priorityByTaskId, b.taskId)}
                disabled={disableRealBlockDrag || blocked}
              />
            ))}
            {dayDrafts.map((draft) => (
              <PlannerBlockCard
                key={draft.tempId}
                block={proposedBlockToPlannerBlock(draft)}
                priority={lookupTaskPriority(priorityByTaskId, draft.taskId)}
                isDraft
                onDiscardDraft={onDiscardDraft}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
