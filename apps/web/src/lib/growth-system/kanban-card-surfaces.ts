/** Shared surface tokens for Tasks kanban cards, compact rows, and project rollups. */

import { cn } from '@/lib/utils';

export const kanbanMetaRowClassName = 'flex flex-wrap items-center gap-1.5';

export const kanbanCompactMetaClassName = 'flex shrink-0 items-center gap-1.5';

export const kanbanCompactAreaBadgeClassName = 'max-w-[5.5rem] truncate';

interface KanbanShellOptions {
  isDragging?: boolean;
  isSelected?: boolean;
  interactive?: boolean;
}

const kanbanShellBaseClassName =
  'border bg-white shadow-sm transition-[opacity,transform,box-shadow,border-color] duration-200 dark:bg-gray-900';

const kanbanDraggingClassName =
  'z-10 opacity-[0.48] shadow-lg ring-2 ring-blue-400/35 dark:ring-blue-500/40 border-gray-200/90 dark:border-gray-700/90';

const kanbanIdleShellClassName = ({
  isSelected,
  interactive,
}: Pick<KanbanShellOptions, 'isSelected' | 'interactive'>) =>
  cn(
    'border-gray-200/90 dark:border-gray-700/90',
    isSelected && 'border-blue-500 ring-1 ring-blue-500/25 dark:border-blue-400',
    !isSelected && 'hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600',
    interactive &&
      'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/80 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900'
  );

/** Detailed card shell — no hover translate (dense-board scannability). */
export function kanbanCardShellClassName({
  isDragging = false,
  isSelected = false,
  interactive = false,
}: KanbanShellOptions = {}): string {
  return cn(
    kanbanShellBaseClassName,
    'cursor-grab rounded-lg p-3 active:cursor-grabbing group',
    isDragging
      ? cn(kanbanDraggingClassName, '-rotate-1 scale-[0.97]')
      : kanbanIdleShellClassName({ isSelected, interactive })
  );
}

/** Compact row shell — fixed height for shared sm meta chips. */
export function kanbanCompactRowShellClassName({
  isDragging = false,
  isSelected = false,
  interactive = false,
}: KanbanShellOptions = {}): string {
  return cn(
    kanbanShellBaseClassName,
    'flex h-10 min-h-10 max-h-10 cursor-grab items-center gap-1.5 rounded-md px-2 active:cursor-grabbing group',
    isDragging
      ? cn(kanbanDraggingClassName, 'scale-[0.98] opacity-50')
      : cn(kanbanIdleShellClassName({ isSelected, interactive }), !isSelected && 'hover:shadow')
  );
}

/** Single class string — do not merge with generic border utilities via cn(). */
export const kanbanProjectRollupShellClassName =
  'overflow-hidden rounded-lg border border-gray-200/90 border-l-4 border-l-blue-500 bg-white shadow-sm dark:border-gray-700/90 dark:border-l-blue-400 dark:bg-gray-900';

export const kanbanProjectHeaderButtonClassName =
  'flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-gray-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/80 dark:hover:bg-gray-800/80';

export const kanbanChevronButtonClassName =
  'mt-0.5 flex shrink-0 items-center justify-center rounded-md p-1 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
