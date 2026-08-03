/** Shared surface tokens for Observability Burn dashboard UI. */

import {
  obsKpiLabelClassName,
  obsPanelClassName,
  obsPanelPaddedClassName,
  obsSectionTitleClassName,
} from '@/lib/observability/observability-surfaces';

export const burnKpiGridClassName = 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5';

export const burnKpiCardClassName = `${obsPanelClassName} p-4`;

export const burnKpiCardEmphasizedClassName =
  'rounded-xl border border-gray-300/80 bg-white p-4 dark:border-gray-600/70 dark:bg-gray-900/70 border-l-4 border-l-violet-500 dark:border-l-violet-400';

export const burnKpiLabelClassName = obsKpiLabelClassName;

export const burnKpiValueEmphasizedClassName =
  'mt-1 text-2xl font-semibold tabular-nums text-gray-900 dark:text-white sm:text-3xl';

export const burnKpiValueQuietClassName =
  'mt-1 text-lg font-semibold tabular-nums text-gray-700 dark:text-gray-200';

export const burnKpiTrendUpClassName = 'text-emerald-600 dark:text-emerald-400';

export const burnKpiTrendDownClassName = 'text-red-600 dark:text-red-400';

export const burnKpiTrendFlatClassName = 'text-gray-500 dark:text-gray-400';

export const burnKpiSubtitleClassName =
  'mt-1 text-xs text-gray-500 dark:text-gray-400 tabular-nums';

export const burnChartCardClassName = obsPanelPaddedClassName;

export const burnChartShellClassName = 'relative flex h-44 items-end gap-0.5';

export const burnChartYAxisClassName =
  'flex h-44 w-10 shrink-0 flex-col justify-between py-0.5 text-[10px] leading-none text-gray-500 tabular-nums dark:text-gray-400';

export const burnChartPlotClassName =
  'relative flex min-w-0 flex-1 flex-col border-b border-gray-200/80 pb-1 dark:border-gray-600/70';

export const burnChartBarsClassName = 'relative flex h-44 items-end gap-0.5';

export const burnChartMaxAnnotationClassName =
  'rounded border border-gray-200/80 bg-gray-50/90 px-1.5 py-0.5 text-[11px] text-gray-500 tabular-nums dark:border-gray-700/70 dark:bg-gray-900/50 dark:text-gray-400';

export const burnChartXTickClassName =
  'text-[11px] leading-tight text-gray-500 tabular-nums dark:text-gray-400';

export const burnTooltipPanelClassName =
  'pointer-events-none absolute bottom-full z-20 mb-2 w-max max-w-[240px] rounded-lg border border-gray-200/80 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-600/70 dark:bg-gray-900/90';

export const burnBreakdownCardClassName = `${obsPanelPaddedClassName} overflow-x-auto`;

export const burnBreakdownToolbarClassName =
  'mb-3 flex flex-wrap items-center justify-between gap-3';

export const burnBreakdownGroupByClassName =
  'flex items-center gap-2 rounded-lg border border-gray-200/80 bg-gray-50/90 px-3 py-1.5 dark:border-gray-700/70 dark:bg-gray-900/50';

export const burnBreakdownGroupByLabelClassName =
  'text-xs font-medium text-gray-600 dark:text-gray-300';

export const burnBreakdownSelectClassName =
  'rounded border border-gray-300/80 bg-white px-2 py-1 text-sm dark:border-gray-600/70 dark:bg-gray-900/80';

export const burnBreakdownSectionTitleClassName = obsSectionTitleClassName;

export const burnBreakdownThNumericClassName = 'py-2 pl-4 pr-2 text-right';

export const burnBreakdownTdNumericClassName =
  'py-2 pl-4 pr-2 text-right font-mono text-xs tabular-nums';

export const burnBreakdownTdKeyClassName = 'py-2 pr-4 font-mono text-xs';

export const burnBreakdownTdActionsClassName = 'py-2 text-right';

export const burnChartSkeletonBarsClassName = 'flex h-44 items-end gap-1';

export const burnBreakdownTableMinWidthClassName = 'min-w-[640px] w-full text-sm';
