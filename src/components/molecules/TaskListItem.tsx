import { Pencil, Trash2, Calendar, Clock, GitBranch, Coins } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Task } from '@/types/growth-system';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { DependencyBadge } from '@/components/atoms/DependencyBadge';
import Button from '@/components/atoms/Button';

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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

export function TaskListItem({
  task,
  onEdit,
  onDelete,
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
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: date.toLocaleDateString(), overdue: true };
    } else if (diffDays === 0) {
      return { text: 'Today', urgent: true };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} days`, warning: true };
    } else {
      return { text: date.toLocaleDateString(), normal: true };
    }
  };

  const dueInfo = formatDate(task.dueDate);
  const scheduledInfo = formatDate(task.scheduledDate);

  const actionVisibilityClass =
    actionsVisibility === 'always' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100';

  return (
    // Task card: clickable when onClick is provided, with full keyboard and accessibility support
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${
        onClick
          ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          : ''
      }`}
      onClick={(e) => {
        // Don't trigger click if clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) {
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2.5">
            <PriorityIndicator priority={task.priority} size="sm" variant="badge" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base leading-tight">
              {task.title}
            </h3>
            <StatusBadge status={task.status} size="sm" />
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5 text-sm">
            <AreaBadge area={task.area} size="sm" />

            {(projectCount > 0 || goalCount > 0) && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {projectCount > 0 && `Projects: ${projectCount}`}
                {projectCount > 0 && goalCount > 0 && ' • '}
                {goalCount > 0 && `Goals: ${goalCount}`}
              </span>
            )}

            {task.size && (
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                Size: {task.size}
              </span>
            )}

            {task.pointValue && (
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500" />
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  {task.pointValue} pts
                </span>
              </div>
            )}

            {dueInfo && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span
                  className={`text-xs font-medium ${
                    dueInfo.overdue
                      ? 'text-red-600 dark:text-red-400'
                      : dueInfo.urgent
                        ? 'text-orange-600 dark:text-orange-400'
                        : dueInfo.warning
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {dueInfo.text}
                </span>
              </div>
            )}

            {scheduledInfo && !dueInfo && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {scheduledInfo.text}
                </span>
              </div>
            )}

            {blockedByCount > 0 && (
              <DependencyBadge
                type="blocked"
                count={blockedByCount}
                tooltip={
                  blockedByTasks.length > 0
                    ? `Blocked by:\n${blockedByTasks.map((t) => `• ${t.title}`).join('\n')}`
                    : undefined
                }
              />
            )}

            {dependencyCount > 0 && (
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <GitBranch className="w-3.5 h-3.5" />
                <span className="text-xs">{dependencyCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons container - stops event propagation to prevent card click */}
        {}
        <div
          className={`flex items-center gap-1.5 transition-opacity ${actionVisibilityClass}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="group"
          aria-label="Task actions"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(task)}
            className="!p-2 hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/20 dark:hover:!text-blue-400"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(task)}
            className={
              deleteButtonClassName ||
              '!p-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/20 dark:hover:!text-red-400'
            }
            aria-label={deleteAriaLabel || deleteLabel}
          >
            {deleteIcon || <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
