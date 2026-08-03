import { Archive, Check } from 'lucide-react';

import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { VelocityDragBadge } from '@/components/molecules/VelocityDragInterventionCard';
import {
  plannerRolloverBacklogButtonClassName,
  plannerRolloverBadgeBaseClassName,
  plannerRolloverBadgeClassName,
  plannerRolloverCardClassName,
  plannerRolloverCardDragClassName,
  plannerRolloverKeepButtonClassName,
  plannerRolloverOverdueBadgeClassName,
} from '@/lib/planner/planner-surfaces';
import type { PlannerRolloverAction, PlannerRolloverTask } from '@/types/planner';
import type { Priority } from '@/types/growth-system';
import { isVelocityDragDetected } from '@/types/growth-system';

export interface RolloverTaskCardProps {
  task: PlannerRolloverTask;
  disabled?: boolean;
  pendingAction?: PlannerRolloverAction | null;
  onAction: (rolloverId: string, action: PlannerRolloverAction) => void;
}

export function RolloverTaskCard({
  task,
  disabled,
  pendingAction,
  onAction,
}: RolloverTaskCardProps) {
  const badgeClass =
    task.badge === 'Overdue' ? plannerRolloverOverdueBadgeClassName : plannerRolloverBadgeClassName;

  const busyKeep = pendingAction === 'keep';
  const busyBacklog = pendingAction === 'backlog';

  const dragDetected = task.velocityDragDetected ?? isVelocityDragDetected(task.rolloverCount);

  return (
    <article
      className={dragDetected ? plannerRolloverCardDragClassName : plannerRolloverCardClassName}
      data-testid={`rollover-card-${task.taskId}`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`${plannerRolloverBadgeBaseClassName} ${badgeClass}`}
          data-testid="rollover-status-badge"
        >
          {task.badge}
        </span>
        <VelocityDragBadge rolloverCount={task.rolloverCount} />
      </div>
      <div className="flex min-w-0 items-start gap-1.5">
        <PriorityIndicator
          priority={task.priority as Priority}
          variant="badge"
          size="sm"
          className="shrink-0"
        />
        <p
          className="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-gray-100"
          title={task.title}
          aria-label={task.title}
        >
          {task.title}
        </p>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-600 dark:text-gray-500">
        <span>from {task.sourceDate.slice(5)}</span>
        {task.storyPoints > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span className="font-medium text-gray-500 dark:text-gray-400">
              {task.storyPoints} SP
            </span>
          </>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2" data-testid="rollover-actions">
        <button
          type="button"
          disabled={disabled || busyKeep || busyBacklog}
          aria-label={busyKeep ? 'Keeping task for today' : 'Keep task for today'}
          className={plannerRolloverKeepButtonClassName}
          onClick={(e) => {
            e.stopPropagation();
            onAction(task.rolloverId, 'keep');
          }}
        >
          <Check className="h-3 w-3 shrink-0" />
          {busyKeep ? 'Keeping…' : 'Keep'}
        </button>
        <button
          type="button"
          disabled={disabled || busyKeep || busyBacklog}
          aria-label={busyBacklog ? 'Moving task to backlog' : 'Move task to backlog'}
          className={plannerRolloverBacklogButtonClassName}
          onClick={(e) => {
            e.stopPropagation();
            onAction(task.rolloverId, 'backlog');
          }}
        >
          <Archive className="h-3 w-3 shrink-0" />
          {busyBacklog ? 'Moving…' : 'Backlog'}
        </button>
      </div>
    </article>
  );
}
