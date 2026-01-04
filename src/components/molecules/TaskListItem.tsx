import { Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import type { Task } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { StatusBadge } from '../atoms/StatusBadge';
import Button from '../atoms/Button';

interface TaskListItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onClick?: (task: Task) => void;
}

export function TaskListItem({ task, onEdit, onDelete, onClick }: TaskListItemProps) {
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

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <PriorityIndicator priority={task.priority} size="sm" />
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <AreaBadge area={task.area} />

            {task.subCategory && (
              <span className="text-gray-500 dark:text-gray-400">
                {task.subCategory}
              </span>
            )}

            {task.size && (
              <span className="text-gray-500 dark:text-gray-400">
                Size: {task.size}
              </span>
            )}

            {dueInfo && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span
                  className={`${
                    dueInfo.overdue
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : dueInfo.urgent
                      ? 'text-orange-600 dark:text-orange-400 font-semibold'
                      : dueInfo.warning
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Due: {dueInfo.text}
                </span>
              </div>
            )}

            {scheduledInfo && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-gray-500 dark:text-gray-400">
                  Scheduled: {scheduledInfo.text}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(task)}
            className="!p-2"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(task)}
            className="!p-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
