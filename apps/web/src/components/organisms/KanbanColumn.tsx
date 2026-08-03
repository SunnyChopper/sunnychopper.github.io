import { Fragment, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Project, Task, TaskStatus, UpdateTaskInput } from '@/types/growth-system';
import { KanbanCard } from '@/components/molecules/KanbanCard';
import { KanbanCompactRow } from '@/components/molecules/KanbanCompactRow';
import { KanbanProjectRollup } from '@/components/molecules/KanbanProjectRollup';
import { buildKanbanColumnItems } from '@/components/organisms/kanban/build-kanban-column-items';
import { Plus, MoreVertical, ArrowRight, ArrowUpDown } from 'lucide-react';
import { TASK_STATUS_LABELS } from '@/constants/growth-system';
import { KANBAN_STATUSES, type KanbanCardDensity } from '@/lib/growth-system/kanban-constants';
import {
  getKanbanColumnEnterTransition,
  getKanbanColumnMetricsCountClassName,
  kanbanColumnActionButtonClassName,
  kanbanColumnActionsClusterClassName,
  kanbanColumnDragOverClassName,
} from '@/lib/growth-system/kanban-column-motion';

export function KanbanCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="animate-pulse space-y-3 rounded-lg border border-gray-200/80 bg-white p-3 dark:border-gray-700/80 dark:bg-gray-900"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-2">
        <div className="h-5 w-8 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export interface KanbanColumnProps {
  status: TaskStatus;
  projects?: Project[];
  cardDensity: KanbanCardDensity;
  /** Tailwind classes for the status accent dot (e.g. bg-blue-500) */
  accentClassName: string;
  statusTasks: Task[];
  totalEffort: number;
  isLoading: boolean;
  isDragOver: boolean;
  columnIndex: number;
  draggedTask: Task | null;
  onTaskCreate: (status: TaskStatus) => void;
  onTaskUpdate: (id: string, input: UpdateTaskInput) => void;
  onTaskEdit: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskRestore?: (task: Task) => void;
  activeTaskId?: string | null;
  isTrashColumn?: boolean;
  columnLabel?: string;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
}

function renderStandaloneTaskCard(options: {
  task: Task;
  taskIndex: number;
  useCompactRows: boolean;
  isBacklogColumn: boolean;
  draggedTask: Task | null;
  activeTaskId?: string | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  onTaskEdit: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate: (id: string, input: UpdateTaskInput) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskRestore?: (task: Task) => void;
  trashMode?: boolean;
  disableDrag?: boolean;
}) {
  const {
    task,
    taskIndex,
    useCompactRows,
    isBacklogColumn,
    draggedTask,
    activeTaskId = null,
    onDragStart,
    onDragEnd,
    onTaskEdit,
    onTaskClick,
    onTaskUpdate,
    onTaskDelete,
    onTaskRestore,
    trashMode = false,
    disableDrag = false,
  } = options;

  const isSelected = task.id === activeTaskId;

  if (useCompactRows) {
    return (
      <KanbanCompactRow
        key={task.id}
        task={task}
        taskIndex={taskIndex}
        isBeingDragged={draggedTask?.id === task.id}
        isSelected={isSelected}
        trashMode={trashMode}
        disableDrag={disableDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onEdit={onTaskEdit}
        onDelete={onTaskDelete}
        onRestore={onTaskRestore}
        onOpen={onTaskClick}
        onPromote={
          isBacklogColumn && !trashMode
            ? (t) => onTaskUpdate(t.id, { status: 'Not Started' })
            : undefined
        }
      />
    );
  }

  return (
    <KanbanCard
      key={task.id}
      task={task}
      taskIndex={taskIndex}
      isBeingDragged={draggedTask?.id === task.id}
      isSelected={isSelected}
      trashMode={trashMode}
      disableDrag={disableDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onEdit={onTaskEdit}
      onDelete={onTaskDelete}
      onRestore={onTaskRestore}
      onOpen={onTaskClick}
    />
  );
}

function renderColumnMetrics(count: number, totalEffort: number, isLoading: boolean) {
  if (isLoading) {
    return (
      <span className="inline-block h-3 w-24 animate-pulse rounded bg-gray-300/80 dark:bg-gray-600/80" />
    );
  }

  const countClassName = getKanbanColumnMetricsCountClassName(count);

  return (
    <>
      <span className={countClassName}>
        {count} {count === 1 ? 'task' : 'tasks'}
      </span>
      <span className="text-gray-400 dark:text-gray-500"> · </span>
      <span className="text-gray-500 dark:text-gray-400">{totalEffort} SP</span>
    </>
  );
}

export function KanbanColumn({
  status,
  projects = [],
  cardDensity,
  accentClassName,
  statusTasks,
  totalEffort,
  isLoading,
  isDragOver,
  columnIndex,
  draggedTask,
  onTaskCreate,
  onTaskUpdate,
  onTaskEdit,
  onTaskClick,
  onTaskDelete,
  onTaskRestore,
  activeTaskId = null,
  isTrashColumn = false,
  columnLabel,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
}: KanbanColumnProps) {
  const reduceMotion = useReducedMotion();
  const isBacklogColumn = status === 'Backlog' && !isTrashColumn;
  const displayLabel = columnLabel ?? TASK_STATUS_LABELS[status];
  const readOnlyColumn = isTrashColumn;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const useCompactRows = cardDensity === 'compact';
  const columnItems = useMemo(() => buildKanbanColumnItems(statusTasks), [statusTasks]);
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const buttonMotionProps = reduceMotion
    ? {}
    : { whileTap: { scale: 0.92 }, whileHover: { scale: 1.05 } };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleMoveAllTasks = (_fromStatus: TaskStatus, toStatus: TaskStatus) => {
    statusTasks.forEach((task) => {
      if (task.status !== toStatus) {
        onTaskUpdate(task.id, { status: toStatus });
      }
    });
    setMenuOpen(false);
  };

  const handleSortByPriority = () => {
    setMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((o) => !o);
  };

  const columnShellClassName =
    'group/column flex min-h-0 flex-1 overflow-hidden rounded-xl bg-gray-100/90 dark:bg-gray-800/70';
  const columnOuterClassName = 'flex h-full min-h-0 w-[17.5rem] shrink-0 flex-col sm:w-80';
  const dropZoneClassName = `min-h-0 flex-1 overflow-y-auto rounded-lg px-2 pb-3 transition-colors duration-200 ${
    isDragOver ? kanbanColumnDragOverClassName : ''
  }`;

  const columnContent = (
    <div className={columnShellClassName}>
      <span className={`w-[3px] shrink-0 ${accentClassName}`} aria-hidden />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 px-3 pb-2 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${accentClassName}`}
                aria-hidden
              />
              <h3 className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">
                {displayLabel}
              </h3>
            </div>
            {readOnlyColumn ? null : (
              <div className={kanbanColumnActionsClusterClassName}>
                <motion.button
                  type="button"
                  {...buttonMotionProps}
                  onClick={() => onTaskCreate(status)}
                  className={kanbanColumnActionButtonClassName}
                  aria-label="Add task"
                  title="Add task"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
                <div className="relative" ref={menuRef}>
                  <motion.button
                    type="button"
                    {...buttonMotionProps}
                    onClick={toggleMenu}
                    className={kanbanColumnActionButtonClassName}
                    aria-label="Column options"
                    aria-expanded={menuOpen}
                    title="Column options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </motion.button>

                  {menuOpen ? (
                    <div
                      role="presentation"
                      className="absolute right-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setMenuOpen(false);
                      }}
                    >
                      <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Move all tasks
                      </div>
                      {KANBAN_STATUSES.filter((s) => s !== status).map((targetStatus) => (
                        <button
                          key={targetStatus}
                          type="button"
                          onClick={() => handleMoveAllTasks(status, targetStatus)}
                          disabled={statusTasks.length === 0}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          <ArrowRight className="h-4 w-4 shrink-0" />
                          <span>To {TASK_STATUS_LABELS[targetStatus]}</span>
                        </button>
                      ))}
                      <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
                      <button
                        type="button"
                        onClick={handleSortByPriority}
                        disabled={statusTasks.length === 0}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <ArrowUpDown className="h-4 w-4 shrink-0" />
                        <span>Sort by priority</span>
                      </button>
                      <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
                      <div className="px-4 py-2 text-xs tabular-nums text-gray-500 dark:text-gray-400">
                        {renderColumnMetrics(statusTasks.length, totalEffort, false)}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          <div className="mt-1.5 min-h-[1.125rem] pl-4 text-xs tabular-nums">
            {renderColumnMetrics(statusTasks.length, totalEffort, isLoading)}
          </div>
        </div>

        <div className={dropZoneClassName}>
          <div className={useCompactRows ? 'space-y-1 pt-0.5' : 'space-y-2.5 pt-0.5'}>
            {isLoading ? (
              <div
                className={useCompactRows ? 'space-y-1' : 'space-y-2.5'}
                aria-busy="true"
                aria-label="Loading tasks"
              >
                {useCompactRows ? (
                  <>
                    <div className="h-10 animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-700/80" />
                    <div className="h-10 animate-pulse rounded-md bg-gray-200/80 dark:bg-gray-700/80" />
                  </>
                ) : (
                  <>
                    <KanbanCardSkeleton index={0} />
                    <KanbanCardSkeleton index={1} />
                  </>
                )}
              </div>
            ) : statusTasks.length === 0 ? (
              <div className="flex h-full min-h-[8rem] items-center justify-center px-2">
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {isDragOver && !readOnlyColumn ? (
                    <span className="font-medium text-blue-600 dark:text-blue-400">Drop here</span>
                  ) : readOnlyColumn ? (
                    <p>Trash is empty</p>
                  ) : (
                    <>
                      <p>
                        No tasks yet{' '}
                        <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                          ·
                        </span>{' '}
                        <button
                          type="button"
                          onClick={() => onTaskCreate(status)}
                          className="text-xs font-medium text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-1 dark:text-blue-400 dark:focus-visible:ring-offset-gray-900"
                        >
                          + Add a card
                        </button>
                      </p>
                      {isBacklogColumn ? (
                        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                          Capture anything. Promote to <strong>Not Started</strong> when it&apos;s
                          on deck.
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {isTrashColumn
                  ? statusTasks.map((task, taskIndex) =>
                      renderStandaloneTaskCard({
                        task,
                        taskIndex,
                        useCompactRows,
                        isBacklogColumn,
                        draggedTask,
                        activeTaskId,
                        onDragStart,
                        onDragEnd,
                        onTaskEdit,
                        onTaskClick,
                        onTaskUpdate,
                        onTaskDelete,
                        onTaskRestore,
                        trashMode: true,
                        disableDrag: true,
                      })
                    )
                  : columnItems.map((item, itemIndex) => {
                      if (item.kind === 'rollup') {
                        const project = projectById.get(item.projectId);
                        if (!project) {
                          return (
                            <Fragment key={`rollup-fallback-${item.projectId}`}>
                              {item.tasks.map((task, taskIndex) =>
                                renderStandaloneTaskCard({
                                  task,
                                  taskIndex,
                                  useCompactRows,
                                  isBacklogColumn,
                                  draggedTask,
                                  activeTaskId,
                                  onDragStart,
                                  onDragEnd,
                                  onTaskEdit,
                                  onTaskClick,
                                  onTaskUpdate,
                                  onTaskDelete,
                                  onTaskRestore,
                                })
                              )}
                            </Fragment>
                          );
                        }

                        return (
                          <KanbanProjectRollup
                            key={`rollup-${item.projectId}`}
                            project={project}
                            tasks={item.tasks}
                            cardDensity={cardDensity}
                            columnStatus={status}
                            itemIndex={itemIndex}
                            draggedTask={draggedTask}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onTaskEdit={onTaskEdit}
                            onTaskClick={onTaskClick}
                            onTaskDelete={onTaskDelete}
                            activeTaskId={activeTaskId}
                            onTaskUpdate={onTaskUpdate}
                          />
                        );
                      }

                      return renderStandaloneTaskCard({
                        task: item.task,
                        taskIndex: itemIndex,
                        useCompactRows,
                        isBacklogColumn,
                        draggedTask,
                        activeTaskId,
                        onDragStart,
                        onDragEnd,
                        onTaskEdit,
                        onTaskClick,
                        onTaskUpdate,
                        onTaskDelete,
                        onTaskRestore,
                      });
                    })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (reduceMotion) {
    return (
      <div
        className={columnOuterClassName}
        role="region"
        aria-label={`${displayLabel} column`}
        onDragOver={readOnlyColumn ? undefined : (e) => onDragOver(e, status)}
        onDragLeave={readOnlyColumn ? undefined : onDragLeave}
        onDrop={readOnlyColumn ? undefined : (e) => onDrop(e, status)}
        data-testid="kanban-column-static"
      >
        {columnContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getKanbanColumnEnterTransition(columnIndex)}
      className={columnOuterClassName}
      role="region"
      aria-label={`${displayLabel} column`}
      onDragOver={readOnlyColumn ? undefined : (e) => onDragOver(e, status)}
      onDragLeave={readOnlyColumn ? undefined : onDragLeave}
      onDrop={readOnlyColumn ? undefined : (e) => onDrop(e, status)}
    >
      {columnContent}
    </motion.div>
  );
}
