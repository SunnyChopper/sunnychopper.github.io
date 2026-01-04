import { useState } from 'react';
import type { Task, TaskStatus, UpdateTaskInput } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { Pencil, Plus } from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: string, input: UpdateTaskInput) => void;
  onTaskEdit: (task: Task) => void;
  onTaskCreate: (status: TaskStatus) => void;
}

const STATUSES: TaskStatus[] = ['NotStarted', 'InProgress', 'Blocked', 'OnHold', 'Done', 'Cancelled'];

const STATUS_LABELS: Record<TaskStatus, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Blocked: 'Blocked',
  OnHold: 'On Hold',
  Done: 'Done',
  Cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  NotStarted: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  InProgress: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
  Blocked: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700',
  OnHold: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
  Done: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700',
  Cancelled: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
};

export function TaskKanbanBoard({ tasks, onTaskUpdate, onTaskEdit, onTaskCreate }: TaskKanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getTotalEffort = (status: TaskStatus) => {
    const statusTasks = getTasksByStatus(status);
    return statusTasks.reduce((sum, task) => sum + (task.size || 0), 0);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onTaskUpdate(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusTasks = getTasksByStatus(status);
        const totalEffort = getTotalEffort(status);

        return (
          <div
            key={status}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`rounded-lg border-2 ${STATUS_COLORS[status]} h-full flex flex-col`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {STATUS_LABELS[status]}
                  </h3>
                  <button
                    onClick={() => onTaskCreate(status)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span>{statusTasks.length} tasks</span>
                  {totalEffort > 0 && <span>{totalEffort} pts</span>}
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {statusTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                    No tasks
                  </div>
                ) : (
                  statusTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-move hover:shadow-md transition-shadow ${
                        draggedTask?.id === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <PriorityIndicator priority={task.priority} size="sm" />
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {task.title}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <AreaBadge area={task.area} size="sm" />
                        {task.size && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {task.size} pts
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
