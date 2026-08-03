/** Shared surface tokens for Projects page filters bar and active chip row. */

import { cn } from '@/lib/utils';
import { formFieldClassName } from '@/components/atoms/FormInput';

export const projectsFiltersPanelClassName =
  'min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800';

export const projectsFiltersSummaryRowClassName =
  'mb-3 flex min-h-[32px] min-w-0 flex-wrap items-center gap-2';

export const projectsActiveChipsRowClassName = 'mb-3 flex min-w-0 flex-wrap items-center gap-2';

export const projectsFiltersGridClassName = 'grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3';

export const projectsFilterFieldLabelClassName =
  'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

export const projectsFilterSelectClassName = cn(
  formFieldClassName,
  'min-h-[40px] w-full rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500/30 dark:focus-visible:ring-blue-400/25'
);

export const projectsFilterSelectActiveClassName =
  'border-blue-400 bg-blue-50/60 dark:border-blue-500/70 dark:bg-blue-950/30';

export const projectsFilterChipClassName =
  'inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300';

export const projectsFilterChipRemoveClassName =
  'inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full text-blue-600 transition-colors hover:bg-blue-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-800/60';

export const projectsFiltersEmptySummaryClassName = 'text-xs text-gray-500 dark:text-gray-400';
