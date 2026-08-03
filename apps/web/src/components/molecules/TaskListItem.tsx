import {
  AlignLeft,
  Calendar,
  Check,
  Clock,
  GitBranch,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '@/types/growth-system';
import { VelocityDragBadge } from '@/components/molecules/VelocityDragInterventionCard';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { DependencyBadge } from '@/components/atoms/DependencyBadge';
import { PointBadge } from '@/components/atoms/PointBadge';
import { pointBadgeStatusFromTask, pointBadgeStatusHint } from '@/lib/point-badge';
import Button from '@/components/atoms/Button';
import { cn } from '@/lib/utils';
import { formatTaskStoryPointsLabel } from '@/constants/growth-system';
import { differenceInCalendarDaysLocal, formatDateString } from '@/utils/date-formatters';

/** Dense single-line row when the row container is ≥36rem (see task-list-view-density contract L1). */
export const TASK_LIST_ITEM_DENSE_GRID =
  '@[36rem]:grid @[36rem]:grid-cols-[auto_minmax(8rem,1fr)_7.5rem_5rem_6.5rem_auto] @[36rem]:items-center @[36rem]:gap-x-3';

type DateInfo = {
  text: string;
  overdue?: boolean;
  urgent?: boolean;
  warning?: boolean;
  normal?: boolean;
};

function TaskRewardPointsRow({ task, compact }: { task: Task; compact?: boolean }) {
  const status = pointBadgeStatusFromTask(task);
  const hint = pointBadgeStatusHint(status);
  return (
    <div className="flex min-w-0 items-center gap-1">
      <PointBadge value={task.pointValue!} status={status} size={compact ? 'sm' : 'md'} />
      {!compact && hint ? (
        <span className="hidden truncate text-xs text-gray-500 xl:inline dark:text-gray-400">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function SubtaskProgressChip({ task }: { task: Task }) {
  if (task.subtaskCount == null || task.subtaskCount <= 0) return null;
  const completed = task.completedSubtaskCount ?? 0;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-gray-600 dark:bg-gray-700/80 dark:text-gray-300"
      title={`${completed} of ${task.subtaskCount} subtasks complete`}
    >
      {completed}/{task.subtaskCount}
    </span>
  );
}

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onClick?: (task: Task) => void;
  dependencyCount?: number;
  blockedByCount?: number;
  blockedByTasks?: Task[];
  projectCount?: number;
  goalCount?: number;
  deleteLabel?: string;
  deleteAriaLabel?: string;
  deleteIcon?: ReactNode;
  deleteButtonClassName?: string;
  actionsVisibility?: 'hover' | 'always';
}

function formatDueDate(dateString: string | null): DateInfo | null {
  if (!dateString) return null;
  const diffDays = differenceInCalendarDaysLocal(dateString);
  if (diffDays === null) return null;

  if (diffDays < 0) {
    return {
      text: formatDateString(dateString, { month: 'short', day: 'numeric', year: 'numeric' }) ?? '',
      overdue: true,
    };
  }
  if (diffDays === 0) return { text: 'Today', urgent: true };
  if (diffDays === 1) return { text: 'Tomorrow', urgent: true };
  if (diffDays <= 7) return { text: `${diffDays}d`, warning: true };
  return {
    text: formatDateString(dateString, { month: 'short', day: 'numeric' }) ?? '',
    normal: true,
  };
}

function dueDateClassName(dueInfo: DateInfo) {
  if (dueInfo.overdue) return 'text-red-600 dark:text-red-400';
  if (dueInfo.urgent) return 'text-orange-600 dark:text-orange-400';
  if (dueInfo.warning) return 'text-yellow-700 dark:text-yellow-400';
  return 'text-gray-500 dark:text-gray-400';
}

export function TaskListItem({
  task,
  onEdit,
  onDelete,
  onRestore,
  onComplete,
  onClick,
  dependencyCount = 0,
  blockedByCount = 0,
  blockedByTasks = [],
  projectCount = 0,
  goalCount = 0,
  deleteLabel = 'Delete task',
  deleteAriaLabel,
  deleteIcon,
  deleteButtonClassName,
  actionsVisibility = 'hover',
}: TaskListItemProps) {
  const isDone = task.status === 'Done';
  const showDoneAction = Boolean(onComplete) && !isDone;

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const dueInfo = formatDueDate(task.dueDate);
  const scheduledInfo = formatDueDate(task.scheduledDate);
  const displayDate = dueInfo ?? (scheduledInfo && !dueInfo ? scheduledInfo : null);
  const isScheduledOnly = !dueInfo && Boolean(scheduledInfo);

  const hasSecondaryChrome =
    Boolean(task.rolloverCount) ||
    Boolean(task.description || task.extendedDescription) ||
    projectCount > 0 ||
    goalCount > 0 ||
    blockedByCount > 0 ||
    dependencyCount > 0 ||
    (task.subtaskCount != null && task.subtaskCount > 0);

  const iconButtonClass =
    'touch-manipulation !h-9 !min-h-[36px] !w-9 !min-w-[36px] !max-w-[36px] !shrink-0 !rounded-md !px-0 !py-0 @[36rem]:!h-8 @[36rem]:!min-h-[32px] @[36rem]:!w-8 @[36rem]:!min-w-[32px] @[36rem]:!max-w-[32px]';

  const actionsRevealClass =
    actionsVisibility === 'hover'
      ? '@[36rem]:opacity-0 @[36rem]:transition-opacity @[36rem]:duration-150 @[36rem]:group-hover:opacity-100 @[36rem]:group-focus-within:opacity-100'
      : '';

  const renderActions = (size: 'desktop' | 'mobile') => (
    <div
      className={cn(
        'flex shrink-0 flex-nowrap items-center justify-end gap-0.5',
        size === 'desktop' ? actionsRevealClass : ''
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="group"
      aria-label="Task actions"
    >
      {size === 'desktop' ? (
        <StatusBadge status={task.status} size="sm" className="mr-1 hidden xl:inline-flex" />
      ) : (
        <StatusBadge status={task.status} size="sm" className="mr-1" />
      )}
      {showDoneAction ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onComplete!(task)}
          aria-label={`Mark done: ${task.title}`}
          title="Mark done"
          className={cn(
            iconButtonClass,
            'text-gray-500 hover:bg-green-50 hover:text-green-700 dark:text-gray-400 dark:hover:bg-green-900/25 dark:hover:text-green-400'
          )}
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onEdit(task)}
        aria-label={`Edit task: ${task.title}`}
        title="Edit"
        className={cn(
          iconButtonClass,
          'text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700/80 dark:hover:text-blue-400'
        )}
      >
        <Pencil className="h-4 w-4 shrink-0" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => (onRestore ? onRestore(task) : onDelete(task))}
        aria-label={onRestore ? `Restore task: ${task.title}` : deleteAriaLabel || deleteLabel}
        title={onRestore ? 'Restore' : deleteLabel}
        className={cn(
          iconButtonClass,
          onRestore
            ? 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-gray-400 dark:hover:bg-emerald-900/25 dark:hover:text-emerald-400'
            : 'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/25 dark:hover:text-red-400',
          deleteButtonClassName
        )}
      >
        {onRestore ? (
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          deleteIcon || <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
        )}
      </Button>
    </div>
  );

  const pointsCell = (
    <div className="min-w-0 truncate tabular-nums">
      {task.pointValue ? (
        <TaskRewardPointsRow task={task} compact />
      ) : task.size ? (
        <span
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
          title="Story points (Fibonacci)"
        >
          {formatTaskStoryPointsLabel(task.size)}
        </span>
      ) : (
        <span className="text-xs text-gray-300 dark:text-gray-600" aria-hidden>
          —
        </span>
      )}
    </div>
  );

  const dueCell = displayDate ? (
    <div className="flex min-w-0 items-center gap-1 truncate">
      {isScheduledOnly ? (
        <Clock className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
      ) : (
        <Calendar className="h-3 w-3 shrink-0 text-gray-400 dark:text-gray-500" aria-hidden />
      )}
      <span className={cn('truncate text-xs font-medium', dueDateClassName(displayDate))}>
        {displayDate.text}
      </span>
    </div>
  ) : (
    <span className="text-xs text-gray-300 dark:text-gray-600" aria-hidden>
      —
    </span>
  );

  const titleContent = (
    <div className="flex min-w-0 items-center gap-1.5">
      {task.description || task.extendedDescription ? (
        <span title="Has description" className="hidden shrink-0 @[36rem]:inline-flex">
          <AlignLeft
            className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500"
            aria-label="Has description"
          />
        </span>
      ) : null}
      <SubtaskProgressChip task={task} />
      <h3
        className={cn(
          'min-w-0 flex-1 truncate text-sm font-medium',
          isDone ? 'text-gray-500 line-through dark:text-gray-400' : 'text-gray-900 dark:text-white'
        )}
        title={task.title}
      >
        {task.title}
      </h3>
    </div>
  );

  const secondaryChrome = hasSecondaryChrome ? (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-100 pt-1.5 @[36rem]:col-span-full dark:border-gray-700/60">
      <VelocityDragBadge rolloverCount={task.rolloverCount} />
      {task.description || task.extendedDescription ? (
        <span
          className="inline-flex items-center text-gray-400 @[36rem]:hidden dark:text-gray-500"
          title="Has description"
          aria-label="Has description"
        >
          <AlignLeft className="h-3.5 w-3.5" aria-hidden />
        </span>
      ) : null}
      {(projectCount > 0 || goalCount > 0) && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {projectCount > 0 && `Projects: ${projectCount}`}
          {projectCount > 0 && goalCount > 0 && ' · '}
          {goalCount > 0 && `Goals: ${goalCount}`}
        </span>
      )}
      {blockedByCount > 0 ? (
        <DependencyBadge
          type="blocked"
          count={blockedByCount}
          tooltip={
            blockedByTasks.length > 0
              ? `Blocked by:\n${blockedByTasks.map((t) => `• ${t.title}`).join('\n')}`
              : undefined
          }
        />
      ) : null}
      {dependencyCount > 0 ? (
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <GitBranch className="h-3.5 w-3.5" aria-hidden />
          <span className="text-xs tabular-nums">{dependencyCount}</span>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <motion.div
      layoutId={`task-item-${task.id}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
      className={cn(
        '@container group min-w-0 rounded-md border px-3 py-2 transition-colors duration-150 @[36rem]:py-1.5',
        isDone
          ? 'border-gray-200/80 bg-gray-50/80 dark:border-gray-700/60 dark:bg-gray-800/50'
          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600',
        onClick &&
          'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900'
      )}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest('button') ||
          (e.target as HTMLElement).closest('input[type="checkbox"]')
        ) {
          return;
        }
        handleClick();
      }}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `View task details: ${task.title}` : undefined}
    >
      {/* Desktop: aligned grid */}
      <div
        className={cn('hidden min-w-0', TASK_LIST_ITEM_DENSE_GRID)}
        data-testid="task-list-item-dense-layout"
      >
        <div className="shrink-0">
          <PriorityIndicator priority={task.priority} size="sm" variant="dot" />
        </div>
        {titleContent}
        <div className="min-w-0 truncate">
          <AreaBadge area={task.area} size="sm" />
        </div>
        {pointsCell}
        <div className="min-w-0">{dueCell}</div>
        {renderActions('desktop')}
        {secondaryChrome}
      </div>

      {/* Mobile / tablet: stacked compact row */}
      <div
        className="flex min-w-0 flex-col gap-2 @[36rem]:hidden"
        data-testid="task-list-item-stacked-layout"
      >
        <div className="flex min-w-0 items-start gap-2">
          <div className="shrink-0 pt-0.5">
            <PriorityIndicator priority={task.priority} size="sm" variant="badge" />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            {titleContent}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <AreaBadge area={task.area} size="sm" />
              {task.size ? (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {formatTaskStoryPointsLabel(task.size)}
                </span>
              ) : null}
              {task.pointValue ? <TaskRewardPointsRow task={task} compact /> : null}
              {displayDate ? (
                <div className="flex items-center gap-1">
                  {isScheduledOnly ? (
                    <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" aria-hidden />
                  ) : (
                    <Calendar className="h-3 w-3 text-gray-400 dark:text-gray-500" aria-hidden />
                  )}
                  <span className={cn('text-xs font-medium', dueDateClassName(displayDate))}>
                    {displayDate.text}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          {renderActions('mobile')}
        </div>
        {hasSecondaryChrome ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-100 pt-1.5 pl-8 dark:border-gray-700/60">
            <VelocityDragBadge rolloverCount={task.rolloverCount} />
            {(projectCount > 0 || goalCount > 0) && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {projectCount > 0 && `Projects: ${projectCount}`}
                {projectCount > 0 && goalCount > 0 && ' · '}
                {goalCount > 0 && `Goals: ${goalCount}`}
              </span>
            )}
            {blockedByCount > 0 ? (
              <DependencyBadge
                type="blocked"
                count={blockedByCount}
                tooltip={
                  blockedByTasks.length > 0
                    ? `Blocked by:\n${blockedByTasks.map((t) => `• ${t.title}`).join('\n')}`
                    : undefined
                }
              />
            ) : null}
            {dependencyCount > 0 ? (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
                <span className="text-xs tabular-nums">{dependencyCount}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
