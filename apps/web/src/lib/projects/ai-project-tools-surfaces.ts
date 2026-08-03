import { cn } from '@/lib/utils';

export const AI_PROJECT_ASSIST_PANEL_ID = 'ai-project-assist-panel';

export const AI_PROJECT_TOOL_MODES = [
  { id: 'health', label: 'Health Analysis' },
  { id: 'generate', label: 'Generate Tasks' },
  { id: 'risks', label: 'Risk Assessment' },
] as const;

export type AIProjectToolMode = (typeof AI_PROJECT_TOOL_MODES)[number]['id'];

export function aiProjectToolTabId(mode: AIProjectToolMode): string {
  return `ai-project-tool-tab-${mode}`;
}

export const aiProjectToolPillBaseClassName =
  'px-3 py-1.5 text-sm rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

export const aiProjectToolPillSelectedClassName =
  'border-amber-300 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';

export const aiProjectToolPillIdleClassName =
  'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700';

export function aiProjectToolPillClassName(selected: boolean): string {
  return cn(
    aiProjectToolPillBaseClassName,
    selected ? aiProjectToolPillSelectedClassName : aiProjectToolPillIdleClassName
  );
}

export const aiProjectAssistPanelShellClassName =
  'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4';
