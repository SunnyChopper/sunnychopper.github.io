import { todayISOLocal } from '@/lib/planner/week';
import type {
  PlannerBlockingContext,
  PlannerDay,
  PlannerProposedBlock,
  PlannerWeek,
} from '@/types/planner';

export const CLEAR_OOO_CONFIRM_MESSAGE =
  'This day has scheduled tasks. Clear Out of Office anyway? Existing blocks stay; Auto-schedule and Plan Day will be allowed again.';

export type DayBlockToggleAction =
  | { type: 'clear'; exceptionId: string }
  | { type: 'create' }
  | { type: 'explain-non-manual'; source: PlannerBlockingContext['source']; label: string };

export function isPlannerDayBlocked(
  day: Pick<PlannerDay, 'isBlocked' | 'blockingContexts'>
): boolean {
  return Boolean(day.isBlocked || (day.blockingContexts?.length ?? 0) > 0);
}

export function manualBlockingContextForDate(
  day: Pick<PlannerDay, 'blockingContexts'>,
  date: string
): PlannerBlockingContext | undefined {
  return day.blockingContexts?.find((c) => c.isManual && c.startDate <= date && c.endDate >= date);
}

export function canClearManualOutOfOffice(
  day: Pick<PlannerDay, 'blockingContexts'>,
  date: string
): boolean {
  return Boolean(manualBlockingContextForDate(day, date));
}

export function dayHasScheduledWork(
  day: Pick<PlannerDay, 'blocks' | 'scheduledStoryPoints'>
): boolean {
  return (day.blocks?.length ?? 0) > 0 || (day.scheduledStoryPoints ?? 0) > 0;
}

export function isPlannerDayContentEmpty(
  day: Pick<PlannerDay, 'date' | 'blocks' | 'rolloverTasks' | 'isBlocked' | 'blockingContexts'>,
  draftBlocks: PlannerProposedBlock[] = []
): boolean {
  if (isPlannerDayBlocked(day)) {
    return false;
  }
  const hasDrafts = draftBlocks.some((b) => b.date === day.date);
  if (hasDrafts) {
    return false;
  }
  return (day.blocks?.length ?? 0) === 0 && (day.rolloverTasks?.length ?? 0) === 0;
}

export function isPlannerPastWeekEmpty(
  week: Pick<PlannerWeek, 'weekEnd' | 'days'>,
  draftBlocks: PlannerProposedBlock[] = [],
  today: string = todayISOLocal()
): boolean {
  if (week.weekEnd >= today) {
    return false;
  }
  return week.days.every((day) => isPlannerDayContentEmpty(day, draftBlocks));
}

export function resolveDayBlockToggleAction(
  day: Pick<PlannerDay, 'isBlocked' | 'blockingContexts'>,
  date: string
): DayBlockToggleAction {
  const manual = manualBlockingContextForDate(day, date);
  if (manual) {
    return { type: 'clear', exceptionId: manual.id };
  }
  if (isPlannerDayBlocked(day)) {
    const ctx = day.blockingContexts?.[0];
    return {
      type: 'explain-non-manual',
      source: ctx?.source ?? 'calendar',
      label: ctx?.label ?? blockingSourceLabel(ctx?.source ?? 'calendar'),
    };
  }
  return { type: 'create' };
}

export function blockingSourceLabel(source: PlannerBlockingContext['source']): string {
  switch (source) {
    case 'voyager':
      return 'Voyager trip';
    case 'calendar':
      return 'Calendar event';
    case 'standby':
      return 'OOO Standby';
    default:
      return 'Out of Office';
  }
}

export function nonManualBlockedHint(day: Pick<PlannerDay, 'blockingContexts'>): string {
  const ctx = day.blockingContexts?.[0];
  if (!ctx) return 'Blocked';
  const sourceLabel = blockingSourceLabel(ctx.source);
  if (ctx.label && ctx.label !== sourceLabel) {
    return `Blocked by ${sourceLabel}: ${ctx.label}`;
  }
  return `Blocked by ${sourceLabel}`;
}

export function blockingLabel(day: Pick<PlannerDay, 'blockingContexts'>): string {
  const ctx = day.blockingContexts?.[0];
  if (!ctx) return 'Out of Office';
  if (ctx.kind === 'trip') return 'Trip';
  return ctx.label || 'Out of Office';
}

export function blockingOverlayEmoji(day: Pick<PlannerDay, 'blockingContexts'>): string {
  const ctx = day.blockingContexts?.[0];
  return ctx?.kind === 'trip' ? '✈️' : '🏖️';
}
