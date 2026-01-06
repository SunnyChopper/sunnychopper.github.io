import { useState } from 'react';
import type { Task, TaskStatus, UpdateTaskInput } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { Pencil, Plus, MoreVertical } from 'lucide-react';
import { TASK_STATUS_LABELS } from '../../constants/growth-system';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: string, input: UpdateTaskInput) => void;
  onTaskEdit: (task: Task) => void;
  onTaskCreate: (status: TaskStatus) => void;
}

const STATUSES: TaskStatus[] = ['NotStarted', 'InProgress', 'Blocked', 'OnHold'];

const STATUS_HEADER_COLORS: Record<TaskStatus, string> = {
  NotStarted: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  InProgress: 'bg-blue-500 text-white',
  Blocked: 'bg-red-500 text-white',
  OnHold: 'bg-yellow-500 text-white',
  Done: 'bg-green-500 text-white',
  Cancelled: 'bg-gray-400 text-white',
};

export function TaskKanbanBoard({ tasks, onTaskUpdate, onTaskEdit, onTaskCreate }: TaskKanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

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

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      onTaskUpdate(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-6 py-6 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 h-full min-w-max">
        {STATUSES.map((status) => {
          const statusTasks = getTasksByStatus(status);
          const totalEffort = getTotalEffort(status);
          const isDragOver = dragOverColumn === status;

          return (
            <div
              key={status}
              className="flex-shrink-0 w-80 flex flex-col"
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className={`${STATUS_HEADER_COLORS[status]} px-4 py-3 rounded-t-lg shadow-sm`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    {TASK_STATUS_LABELS[status]}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTaskCreate(status)}
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="Add task"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-white/20 rounded transition-colors"
                      title="Column options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-90">
                  <span>{statusTasks.length} {statusTasks.length === 1 ? 'task' : 'tasks'}</span>
                  {totalEffort > 0 && (
                    <>
                      <span>•</span>
                      <span>{totalEffort} pts</span>
                    </>
                  )}
                </div>
              </div>

              <div className={`flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-3 space-y-2.5 overflow-y-auto shadow-sm transition-colors ${
                isDragOver ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}>
                {statusTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      {isDragOver ? (
                        <span className="font-medium">Drop here</span>
                      ) : (
                        <>
                          <p>No tasks</p>
                          <button
                            onClick={() => onTaskCreate(status)}
                            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                          >
                            + Add a task
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  statusTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                        draggedTask?.id === task.id ? 'opacity-40 rotate-2 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <PriorityIndicator priority={task.priority} size="sm" />
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
                            {task.title}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskEdit(task);
                          }}
                          className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                          title="Edit task"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <AreaBadge area={task.area} size="sm" />
                        {task.size && task.size > 0 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium">
                            {task.size} pts
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded font-medium">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
