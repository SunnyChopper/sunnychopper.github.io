/** Dual-theme surface class tokens for Health & Fitness admin UI. */

/** Per-module icon accent for page headers (icon color only). */
export type FitnessModuleHeaderAccent = 'blue' | 'emerald' | 'violet' | 'cyan';

export const fitnessModuleHeaderAccentClassName: Record<FitnessModuleHeaderAccent, string> = {
  blue: 'text-blue-600 dark:text-blue-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  violet: 'text-violet-600 dark:text-violet-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
};

/** Shared page header shell for Health & Fitness module routes. */
export const fitnessModulePageHeaderShellClassName =
  'flex flex-wrap items-start justify-between gap-4';

/** Title row: icon + h1. */
export const fitnessModulePageHeaderTitleClassName =
  'text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3';

/** Quiet purpose sentence under the title. */
export const fitnessModulePageHeaderPurposeClassName =
  'text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1';

/** Primary section shell — mirrors WeeklyReviewPage cardClass. */
export const fitnessSectionClassName =
  'rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-none';

/** Standard section padding (24px). */
export const fitnessSectionPaddingClassName = 'p-6';

/** Compact section padding when nested under a page section (16px). */
export const fitnessSectionCompactPaddingClassName = 'p-4';

/** Hero artifact shell — elevated meal plan card after AI generate (interaction-only). */
export const fitnessHeroArtifactClassName =
  'rounded-xl border-2 border-emerald-300/80 bg-white shadow-md ring-1 ring-emerald-500/20 dark:border-emerald-700/60 dark:bg-gray-800 dark:shadow-none dark:ring-emerald-500/10';

/** Actionable status callout (schedule skips, overload hints). */
export const fitnessCalloutClassName =
  'rounded-xl border border-amber-300/80 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100';

/** Success / positive status callout. */
export const fitnessSuccessCalloutClassName =
  'rounded-xl border border-emerald-300/80 bg-emerald-50/90 p-4 text-sm text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-100';

/** Capacity Hub zone shell — one outer panel for today's summary. */
export const fitnessCapacityZoneClassName =
  'rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';

/** Compact interactive nav row for Overview module links. */
export const fitnessNavRowClassName =
  'flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500';

/** Recovery date navigator capsule shell. */
export const fitnessRecoveryDateCapsuleClassName =
  'group/capsule relative flex items-center gap-0.5 self-start rounded-full border border-gray-200/90 bg-white px-1 py-0.5 shadow-sm transition hover:border-gray-300 dark:border-gray-600/90 dark:bg-gray-800 dark:hover:border-gray-500';

/** Inner control hit target inside the recovery date capsule. */
export const fitnessRecoveryDateCapsuleControlClassName =
  'rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700/60 dark:hover:text-white';

/** Interactive set / list row editors. */
export const fitnessInteractiveRowClassName =
  'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50 sm:px-4';
