/** Shared surface tokens for Projects grid cards (hover accent + multi-select chrome). */

import { cn } from '@/lib/utils';
import type { Priority, ProjectStatus } from '@/types/growth-system';

const DEFAULT_PRIORITY: Priority = 'P3';

const PRIORITY_ACCENT_BG: Record<Priority, string> = {
  P1: 'bg-red-500 dark:bg-red-400',
  P2: 'bg-orange-500 dark:bg-orange-400',
  P3: 'bg-yellow-500 dark:bg-yellow-400',
  P4: 'bg-green-500 dark:bg-green-400',
};

const COMPLETE_ACCENT_BG = 'bg-emerald-500 dark:bg-emerald-400';

export function projectPriorityAccentBgClass(priority: Priority | null | undefined): string {
  const normalized: Priority =
    priority && priority in PRIORITY_ACCENT_BG ? priority : DEFAULT_PRIORITY;
  return PRIORITY_ACCENT_BG[normalized];
}

export interface GridProjectAccentBarOptions {
  priority: Priority | null | undefined;
  isWorkComplete: boolean;
  status: ProjectStatus;
}

/** Grid left-bar color: emerald when complete, none when cancelled, else priority. */
export function getGridProjectAccentBarClass({
  priority,
  isWorkComplete,
  status,
}: GridProjectAccentBarOptions): string | null {
  if (status === 'Cancelled') {
    return null;
  }
  if (isWorkComplete || status === 'Completed') {
    return COMPLETE_ACCENT_BG;
  }
  return projectPriorityAccentBgClass(priority);
}

interface ProjectGridCardShellOptions {
  isSelected?: boolean;
}

export function projectGridCardShellClassName({
  isSelected = false,
}: ProjectGridCardShellOptions = {}): string {
  return cn(
    'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-white p-3 text-left dark:bg-gray-800',
    'cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
    'lg:transition-colors lg:duration-200',
    isSelected
      ? 'border-blue-500 ring-1 ring-blue-500/25 dark:border-blue-400 dark:ring-blue-400/25'
      : cn(
          'border-gray-200 dark:border-gray-700',
          'lg:hover:border-blue-500 dark:lg:hover:border-blue-400'
        )
  );
}

/** Left accent bar: hidden at rest; visible on hover, focus-within, or selection. */
export function projectGridAccentBarClassName({
  isSelected = false,
  accentBgClass,
}: {
  isSelected?: boolean;
  accentBgClass: string | null;
}): string | null {
  if (!accentBgClass) {
    return null;
  }
  return cn(
    'pointer-events-none absolute bottom-0 left-0 top-0 w-1 transition-opacity duration-200',
    accentBgClass,
    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
  );
}

interface ProjectGridCheckboxVisibilityOptions {
  isSelected?: boolean;
  selectionActive?: boolean;
}

/** Checkbox wrapper: hover/focus reveal; always visible when selected or selection mode active. */
export function projectGridSelectCheckboxClassName({
  isSelected = false,
  selectionActive = false,
}: ProjectGridCheckboxVisibilityOptions = {}): string {
  return cn(
    'flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md transition-opacity duration-200',
    isSelected || selectionActive
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
  );
}

export const projectGridSelectionStripClassName =
  'mb-3 flex min-h-[32px] min-w-0 flex-wrap items-center gap-2';

export const projectGridSelectionCountClassName =
  'inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
