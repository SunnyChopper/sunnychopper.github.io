/** Dual-theme surface class tokens for Growth System Planner UI. */

export const plannerHeadingClassName = 'text-gray-900 dark:text-white';

export const plannerMutedClassName = 'text-gray-600 dark:text-gray-400';

export const plannerEmphasisClassName = 'text-gray-800 dark:text-gray-200';

export const plannerSubtleClassName = 'text-gray-500 dark:text-gray-500';

export const plannerChipClassName =
  'border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10';

export const plannerChipButtonClassName =
  'rounded-lg transition disabled:opacity-40 disabled:pointer-events-none';

export const plannerPanelClassName =
  'rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-gradient-to-b dark:from-gray-900/50 dark:to-gray-950/80 dark:shadow-inner';

export const plannerFeaturePanelClassName =
  'rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white shadow-lg backdrop-blur-sm dark:border-indigo-500/20 dark:from-indigo-950/40 dark:to-gray-950/60';

export const plannerLinkClassName =
  'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300';

export const plannerErrorBannerClassName =
  'rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';

export const plannerListItemClassName =
  'rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-gray-200';

export const plannerDrawerShellClassName =
  'border-l border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950';

export const plannerFocusPanelClassName =
  'rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-gray-900/80 dark:to-gray-950/90 dark:backdrop-blur-sm';

export const plannerDraftBannerClassName =
  'rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-3 shadow-lg backdrop-blur-sm dark:border-indigo-400/40 dark:bg-indigo-950/90';

export const plannerDraftBannerTitleClassName =
  'text-sm font-semibold text-indigo-900 dark:text-indigo-100';

export const plannerDraftBannerMutedClassName = 'text-xs text-indigo-700 dark:text-indigo-200/80';

/** Rollover task card — default (non velocity-drag) shell. */
export const plannerRolloverCardClassName =
  'rounded-lg border border-amber-400/70 border-l-4 border-l-amber-500 bg-amber-50 p-3 text-xs shadow-md dark:border-amber-500/50 dark:border-l-amber-400 dark:bg-amber-500/[0.12] dark:shadow-amber-500/10';

/** Rollover task card — velocity-drag detected shell. */
export const plannerRolloverCardDragClassName =
  'rounded-lg border border-orange-400/70 border-l-4 border-l-orange-500 bg-orange-50 p-3 text-xs shadow-md dark:border-orange-500/50 dark:border-l-orange-400 dark:bg-orange-500/[0.12] dark:shadow-orange-500/10';

export const plannerRolloverBadgeBaseClassName =
  'rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide';

/** High-contrast Rolled Over chip (light + dark). */
export const plannerRolloverBadgeClassName =
  'bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950';

/** High-contrast Overdue chip (light + dark). */
export const plannerRolloverOverdueBadgeClassName =
  'bg-rose-500 text-white dark:bg-rose-400 dark:text-rose-950';

const plannerRolloverActionFocusClassName =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900';

export const plannerRolloverKeepButtonClassName = `inline-flex items-center justify-center gap-1 rounded-md bg-emerald-600 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-600/80 disabled:cursor-not-allowed disabled:opacity-50 ${plannerRolloverActionFocusClassName} focus-visible:ring-emerald-500`;

export const plannerRolloverBacklogButtonClassName = `inline-flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15 ${plannerRolloverActionFocusClassName} focus-visible:ring-blue-500`;

export const plannerEmptyDaySlotClassName =
  'flex min-h-[120px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300/80 bg-transparent dark:border-gray-600';

export const plannerEmptyDayIconClassName = 'h-4 w-4 text-gray-400 dark:text-gray-500';

export const plannerEmptyCapacityLabelClassName = 'text-gray-400 dark:text-gray-500';

/** Full-week empty state for past weeks with no planned work. */
export const plannerPastWeekEmptyClassName =
  'flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300/80 bg-transparent dark:border-gray-600';

export const plannerPastWeekEmptyTextClassName = 'text-sm text-gray-500 dark:text-gray-400';

/** Today column shell — subtle sky wash (dual-theme). */
export const plannerTodayColumnBgClassName = 'bg-sky-50/90 dark:bg-sky-950/35';

/** Today column border accent when no higher-priority border applies. */
export const plannerTodayColumnBorderClassName = 'border-sky-400 dark:border-sky-500/60';

/** Today column ring when not focused (Plan Day panel closed for that day). */
export const plannerTodayColumnRingClassName = 'ring-2 ring-sky-400/55 dark:ring-sky-400/35';
