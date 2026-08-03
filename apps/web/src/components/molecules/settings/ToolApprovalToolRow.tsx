import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  destructiveToolRowClassName,
  isDestructiveAssistantTool,
} from '@/lib/settings/assistant-tool-approval-ui';
import type { AssistantToolRegistryEntry } from '@/types/api-contracts';

export type ToolApprovalToolRowProps = {
  tool: AssistantToolRegistryEntry;
  checked: boolean;
  onToggle: (name: string) => void;
  disabled?: boolean;
};

export function ToolApprovalToolRow({
  tool,
  checked,
  onToggle,
  disabled = false,
}: ToolApprovalToolRowProps) {
  const destructive = isDestructiveAssistantTool(tool.name);

  return (
    <li className={destructiveToolRowClassName(destructive)}>
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(tool.name)}
          className="mt-0.5 rounded border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:focus-visible:ring-offset-gray-800"
        />
        <span className="min-w-0 flex-1">
          <span className="inline-flex flex-wrap items-center gap-1.5">
            {destructive && (
              <AlertTriangle
                size={14}
                className="shrink-0 text-rose-600 dark:text-rose-400"
                aria-hidden
              />
            )}
            <code
              className={cn(
                'rounded px-1 py-0.5 text-xs',
                destructive
                  ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-100'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}
            >
              {tool.name}
            </code>
            {destructive && <span className="sr-only">Destructive.</span>}
          </span>
          <span className="mt-0.5 block text-gray-600 dark:text-gray-400 sm:mt-0 sm:inline sm:ml-2">
            {tool.description}
          </span>
        </span>
      </label>
    </li>
  );
}
