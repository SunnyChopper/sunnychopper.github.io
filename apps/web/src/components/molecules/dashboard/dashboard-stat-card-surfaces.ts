/** Shared geometry for Dashboard KPI stat cards (loaded + skeleton). */

export const dashboardStatCardShellClassName =
  'group flex h-full bg-white p-4 rounded-lg border border-gray-200 transition hover:accent-border-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:border-gray-700 dark:hover:accent-border-600 dark:focus-visible:ring-offset-gray-800';

export const dashboardStatCardInnerClassName = 'flex items-center gap-4';

export const dashboardStatCardIconTileClassName =
  'flex-shrink-0 rounded-lg p-3 accent-bg-50 accent-text-600 transition group-hover:accent-bg-100 dark:bg-green-900/30 dark:accent-text-400 dark:group-hover:bg-green-900/50';

export const dashboardStatCardTextColumnClassName = 'min-w-0 flex-1';

/** Reserved value slot — same box model for loaded number and skeleton bar. */
export const dashboardStatCardValueSlotClassName = 'mb-1 flex min-h-9 items-center';

export const dashboardStatCardValueClassName =
  'text-3xl font-bold tabular-nums leading-none text-gray-900 dark:text-white';

export const dashboardStatCardValueSkeletonClassName = 'h-9 w-16';

export const dashboardStatCardTitleClassName =
  'text-sm font-medium text-gray-900 dark:text-gray-100';

/** Description line box — skeleton uses same height. */
export const dashboardStatCardDescriptionClassName =
  'truncate text-xs text-gray-600 dark:text-gray-400';

export const dashboardStatCardDescriptionSkeletonClassName = 'mt-0 h-4 max-w-[85%]';

export const dashboardKpiGridClassName =
  'mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3';
