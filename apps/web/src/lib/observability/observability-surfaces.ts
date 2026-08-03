/** Shared surface tokens for Observability cross-tab chrome. */

import { cn } from '@/lib/utils';

export const OBS_TAB_ORDER = ['burn', 'cost', 'executions', 'health', 'initiative'] as const;
export type ObsMainTab = (typeof OBS_TAB_ORDER)[number];

export const OBS_TAB_BUTTON_ID: Record<ObsMainTab, string> = {
  burn: 'obs-tab-burn',
  cost: 'obs-tab-cost',
  executions: 'obs-tab-executions',
  health: 'obs-tab-health',
  initiative: 'obs-tab-initiative',
};

export const OBS_TAB_PANEL_ID: Record<ObsMainTab, string> = {
  burn: 'obs-tabpanel-burn',
  cost: 'obs-tabpanel-cost',
  executions: 'obs-tabpanel-executions',
  health: 'obs-tabpanel-health',
  initiative: 'obs-tabpanel-initiative',
};

export const TAB_FADE_DURATION_S = 0.15;

export const obsPanelClassName =
  'rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/70 dark:bg-gray-900/70';

export const obsPanelPaddedClassName = cn(obsPanelClassName, 'p-4');

export const obsMutedBarClassName =
  'rounded-xl border border-gray-200/80 bg-gray-50/90 px-4 py-3 dark:border-gray-700/70 dark:bg-gray-900/50';

export const obsSectionTitleClassName = 'text-sm font-semibold text-gray-900 dark:text-white';

export const obsPageSectionTitleClassName = 'text-lg font-semibold text-gray-900 dark:text-white';

export const obsSectionDescriptionClassName = 'mt-1 text-sm text-gray-600 dark:text-gray-400';

/** Single class string — do not merge with generic border utilities via cn(). */
export const obsFailedRowAccentClassName = 'border-l-4 border-l-red-500';

export const obsSucceededRowAccentClassName = 'border-l-4 border-l-emerald-500/45';

export const obsKpiLabelClassName =
  'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400';

export const obsTableContainerClassName =
  'overflow-x-auto rounded-xl border border-gray-200/80 bg-white dark:border-gray-700/70 dark:bg-gray-900/70';

export const obsTableMinWidthClassName = 'min-w-[640px] w-full text-sm';

export const obsTableHeadClassName =
  'border-b border-gray-200/80 text-left text-gray-500 dark:border-gray-700/70';

export const obsTabListClassName =
  'border-b border-gray-200/80 dark:border-gray-700/70 flex gap-1 flex-wrap';

export function obsTabClassName(active: boolean): string {
  return cn(
    'px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors min-h-[44px]',
    active
      ? 'border-violet-600 text-violet-700 dark:text-violet-300 bg-white dark:bg-gray-900'
      : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
  );
}

export const obsTabPanelClassName = 'min-h-[24rem] min-w-0';

export const obsAnomalyBannerClassName =
  'rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 dark:border-amber-900/70 dark:bg-amber-950/40';

const FAILED_STATUSES = new Set(['failed', 'error', 'failure', 'exceeded']);

export function obsStatusBadgeClassName(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (FAILED_STATUSES.has(normalized)) {
    return 'font-semibold ring-1 ring-red-300/70 dark:ring-red-700/60';
  }
  if (normalized === 'succeeded' || normalized === 'completed' || normalized === 'active') {
    return 'font-medium';
  }
  return '';
}

export function obsIsFailedStatus(status: string): boolean {
  return FAILED_STATUSES.has(status.trim().toLowerCase());
}
