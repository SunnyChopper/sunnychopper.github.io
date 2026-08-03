import { cn } from '@/lib/utils';
import type { AssistantToolApprovalMode } from '@/types/api-contracts';

export type ToolApprovalModeOption = {
  value: AssistantToolApprovalMode;
  label: string;
  hint: string;
  riskLabel: string;
};

/** Safety-first ladder: Highest → Balanced → Lowest friction. */
export const MODE_OPTIONS: ToolApprovalModeOption[] = [
  {
    value: 'allWrites',
    label: 'Confirm all write actions',
    hint: 'Every tool that changes data needs your approval in the assistant chat.',
    riskLabel: 'Highest safety',
  },
  {
    value: 'dangerousOnly',
    label: 'Confirm dangerous tools only',
    hint: 'Only tools you mark below require an in-chat approval before they run.',
    riskLabel: 'Balanced',
  },
  {
    value: 'none',
    label: 'Auto-approve everything',
    hint: 'No approval prompts; the assistant runs write tools as soon as the model plans them.',
    riskLabel: 'Lowest friction',
  },
];

export function isDestructiveAssistantTool(name: string): boolean {
  return name.startsWith('delete_');
}

export function modeCardClassName(selected: boolean): string {
  return cn(
    'flex cursor-pointer gap-3 rounded-lg border-2 p-3.5 transition-colors',
    selected
      ? 'border-blue-500 bg-blue-50/80 shadow-sm dark:border-blue-600 dark:bg-blue-900/25'
      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/40 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-700/50 dark:hover:bg-blue-900/10 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:ring-offset-1 dark:focus-within:ring-offset-gray-800'
  );
}

export function categoryHeaderClassName(hasApproved: boolean): string {
  return cn(
    'flex w-full items-center gap-2 border-l-[3px] px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset dark:focus-visible:ring-blue-400',
    hasApproved
      ? 'border-l-amber-500 bg-amber-50/60 hover:bg-amber-50/90 dark:border-l-amber-500 dark:bg-amber-950/20 dark:hover:bg-amber-950/35'
      : 'border-l-gray-300 bg-gray-50/90 hover:bg-gray-100 dark:border-l-gray-600 dark:bg-gray-800/40 dark:hover:bg-gray-800/60'
  );
}

export function writeCountBadgeClassName(hasApproved: boolean): string {
  return cn(
    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
    hasApproved
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  );
}

export function destructiveToolRowClassName(isDestructive: boolean): string {
  return cn(
    'px-3 py-2',
    isDestructive &&
      'bg-rose-50/70 dark:bg-rose-950/20 border-l-2 border-l-rose-400/80 dark:border-l-rose-500/60'
  );
}

export const toolApprovalToolbarButtonClassName =
  'text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-800';

export const toolApprovalSearchClassName =
  'flex items-center gap-2 rounded-lg border border-gray-200/80 dark:border-gray-600/80 bg-gray-50/80 dark:bg-gray-800/40 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:ring-offset-1 dark:focus-within:ring-offset-gray-800';
