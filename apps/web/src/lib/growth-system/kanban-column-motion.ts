import type { Variants } from 'framer-motion';

import { KANBAN_COLUMN_BUSY_COUNT } from '@/lib/growth-system/kanban-constants';

/** Stagger delay between Kanban column enter animations (seconds). */
export const KANBAN_COLUMN_ENTER_STAGGER_SECONDS = 0.04;

/** Duration for a single Kanban column enter animation (seconds). */
export const KANBAN_COLUMN_ENTER_DURATION_SECONDS = 0.2;

export const kanbanColumnEnterVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: KANBAN_COLUMN_ENTER_DURATION_SECONDS,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export function getKanbanColumnEnterTransition(columnIndex: number) {
  return {
    delay: columnIndex * KANBAN_COLUMN_ENTER_STAGGER_SECONDS,
    duration: KANBAN_COLUMN_ENTER_DURATION_SECONDS,
    ease: [0.4, 0, 0.2, 1] as const,
  };
}

/** Subdued drag-over highlight — no glow stack. */
export const kanbanColumnDragOverClassName =
  'border border-dashed border-blue-500/50 bg-blue-500/10 dark:bg-blue-400/10';

export function getKanbanColumnMetricsCountClassName(count: number): string {
  if (count === 0) {
    return 'text-gray-400 dark:text-gray-500';
  }
  if (count >= KANBAN_COLUMN_BUSY_COUNT) {
    return 'font-semibold text-gray-800 dark:text-gray-100';
  }
  return 'text-gray-600 dark:text-gray-300';
}

export const kanbanColumnActionButtonClassName =
  'flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-1 dark:text-gray-300 dark:hover:bg-white/10 dark:focus-visible:ring-offset-gray-900';

export const kanbanColumnActionsClusterClassName =
  'flex shrink-0 items-center gap-0.5 opacity-50 transition-opacity group-hover/column:opacity-100 focus-within:opacity-100';
