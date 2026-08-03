import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Task } from '@/types/growth-system';
import { KanbanCardActionsMenu } from '@/components/molecules/KanbanCardActionsMenu';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { PointBadge } from '@/components/atoms/PointBadge';
import { StoryPointsBadge } from '@/components/atoms/StoryPointsBadge';
import { pointBadgeStatusFromTask } from '@/lib/point-badge';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import {
  kanbanCompactAreaBadgeClassName,
  kanbanCompactMetaClassName,
  kanbanCompactRowShellClassName,
} from '@/lib/growth-system/kanban-card-surfaces';

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: [0.34, 1.1, 0.64, 1] as const },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

export interface KanbanCompactRowProps {
  task: Task;
  taskIndex: number;
  isBeingDragged: boolean;
  isSelected?: boolean;
  trashMode?: boolean;
  disableDrag?: boolean;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  onEdit: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onRestore?: (task: Task) => void;
  onOpen?: (task: Task) => void;
  /** Backlog column: quick promote to Not Started */
  onPromote?: (task: Task) => void;
}

/** Single-line Kanban row when board density is compact. */
export function KanbanCompactRow({
  task,
  taskIndex,
  isBeingDragged,
  isSelected = false,
  trashMode = false,
  disableDrag = false,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onRestore,
  onOpen,
  onPromote,
}: KanbanCompactRowProps) {
  const handleActivate = () => {
    if (onOpen) {
      onOpen(task);
      return;
    }
    onEdit(task);
  };

  return (
    <motion.div
      variants={rowVariants}
      initial={false}
      animate="visible"
      exit="exit"
      transition={{ delay: taskIndex * 0.02 }}
      draggable={!disableDrag}
      onDragStart={(e) => {
        if (disableDrag) return;
        const dragEvent = e as unknown as React.DragEvent;
        onDragStart(dragEvent, task);
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button') || isBeingDragged) {
          return;
        }
        handleActivate();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={onOpen ? `View task details: ${task.title}` : `Edit task: ${task.title}`}
      className={kanbanCompactRowShellClassName({
        isDragging: isBeingDragged,
        isSelected,
        interactive: true,
      })}
    >
      <PriorityIndicator priority={task.priority} size="sm" className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
        {task.title}
      </span>
      <div className={kanbanCompactMetaClassName}>
        <AreaBadge area={task.area} size="sm" className={kanbanCompactAreaBadgeClassName} />
        <StoryPointsBadge size={task.size} />
        {task.pointValue != null && task.pointValue > 0 ? (
          <PointBadge
            value={task.pointValue}
            status={pointBadgeStatusFromTask(task)}
            size="sm"
            showPlus
          />
        ) : null}
      </div>
      {onPromote && !trashMode ? (
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onPromote(task);
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 opacity-0 transition-opacity hover:bg-gray-100 hover:text-blue-600 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 group-hover:opacity-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
          title="Promote to Not Started"
          aria-label={`Promote to Not Started: ${task.title}`}
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      ) : null}
      <KanbanCardActionsMenu
        taskTitle={task.title}
        trashMode={trashMode}
        onEdit={() => onEdit(task)}
        onDelete={onDelete ? () => onDelete(task) : undefined}
        onRestore={onRestore ? () => onRestore(task) : undefined}
        className="!opacity-0 group-hover:!opacity-100 group-focus-within:!opacity-100"
      />
    </motion.div>
  );
}
