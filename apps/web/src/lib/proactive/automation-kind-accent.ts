import type { ProactiveAutomationKind } from '@/types/api-contracts';

/** Left border accent per automation kind (dual-theme safe). */
export const KIND_ACCENT_CLASS: Record<ProactiveAutomationKind, string> = {
  dailyBriefing: 'border-l-amber-500 dark:border-l-amber-400',
  logbookEvening: 'border-l-indigo-500 dark:border-l-indigo-400',
  tomorrowPrep: 'border-l-sky-500 dark:border-l-sky-400',
  custom: 'border-l-violet-500 dark:border-l-violet-400',
  dailyLearningTrends: 'border-l-emerald-500 dark:border-l-emerald-400',
  dailyLearningTheory: 'border-l-teal-500 dark:border-l-teal-400',
  staleEntityHunter: 'border-l-orange-500 dark:border-l-orange-400',
};

export function getAutomationKindAccentClass(kind: ProactiveAutomationKind): string {
  return KIND_ACCENT_CLASS[kind];
}
