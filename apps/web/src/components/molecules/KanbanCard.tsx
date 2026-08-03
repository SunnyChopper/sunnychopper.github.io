import { motion } from 'framer-motion';
import type { Task } from '@/types/growth-system';
import { formatDateString } from '@/utils/date-formatters';
import { VelocityDragBadge } from '@/components/molecules/VelocityDragInterventionCard';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { PointBadge } from '@/components/atoms/PointBadge';
import { StoryPointsBadge } from '@/components/atoms/StoryPointsBadge';
import { pointBadgeStatusFromTask } from '@/lib/point-badge';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import {
  kanbanCardShellClassName,
  kanbanMetaRowClassName,
} from '@/lib/growth-system/kanban-card-surfaces';
import { AlignLeft } from 'lucide-react';
import { KanbanCardActionsMenu } from '@/components/molecules/KanbanCardActionsMenu';
import { useEntityExplainChatOptional } from '@/contexts/EntityExplainChatContext';

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: [0.34, 1.15, 0.64, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
  },
};

export interface KanbanCardProps {
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
}

export function KanbanCard({
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
}: KanbanCardProps) {
  const explainChat = useEntityExplainChatOptional();
  const interactive = Boolean(onOpen);

  return (
    <motion.div
      variants={cardVariants}
      initial={false}
      animate="visible"
      exit="exit"
      transition={{ delay: taskIndex * 0.035 }}
      draggable={!disableDrag}
      onDragStart={(e) => {
        if (disableDrag) return;
        const dragEvent = e as unknown as React.DragEvent;
        onDragStart(dragEvent, task);
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (
          (e.target as HTMLElement).closest('button') ||
          (e.target as HTMLElement).closest('input[type="checkbox"]') ||
          isBeingDragged
        ) {
          return;
        }
        onOpen?.(task);
      }}
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.stopPropagation();
          onOpen(task);
        }
      }}
      role={onOpen ? 'button' : 'listitem'}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `View task details: ${task.title}` : `Task: ${task.title}`}
      className={kanbanCardShellClassName({
        isDragging: isBeingDragged,
        isSelected,
        interactive,
      })}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          <PriorityIndicator priority={task.priority} size="sm" className="shrink-0" />
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
            {task.title}
          </h4>
        </div>
        <KanbanCardActionsMenu
          taskTitle={task.title}
          trashMode={trashMode}
          onEdit={() => onEdit(task)}
          onDelete={onDelete ? () => onDelete(task) : undefined}
          onRestore={onRestore ? () => onRestore(task) : undefined}
          onExplain={
            explainChat ? () => explainChat.open({ entityType: 'task', entity: task }) : undefined
          }
        />
      </div>

      <div className={kanbanMetaRowClassName}>
        <VelocityDragBadge rolloverCount={task.rolloverCount} />
        {task.description || task.extendedDescription ? (
          <span
            className="inline-flex items-center text-gray-400 dark:text-gray-500"
            title="Has description — open task to view"
            aria-label="Has description"
          >
            <AlignLeft className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
        <AreaBadge area={task.area} size="sm" />
        <StoryPointsBadge size={task.size} />
        {task.pointValue != null && task.pointValue > 0 ? (
          <PointBadge
            value={task.pointValue}
            status={pointBadgeStatusFromTask(task)}
            size="sm"
            showPlus
          />
        ) : null}
        {task.dueDate ? (
          <span className="rounded-md bg-amber-100/90 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            {formatDateString(task.dueDate, { month: 'short', day: 'numeric' }) ?? ''}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
