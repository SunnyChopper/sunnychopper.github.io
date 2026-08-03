import {
  modeCardClassName,
  type ToolApprovalModeOption,
} from '@/lib/settings/assistant-tool-approval-ui';
import type { AssistantToolApprovalMode } from '@/types/api-contracts';

export type ApprovalModeRadioCardProps = {
  option: ToolApprovalModeOption;
  selected: boolean;
  name: string;
  onSelect: (mode: AssistantToolApprovalMode) => void;
};

export function ApprovalModeRadioCard({
  option,
  selected,
  name,
  onSelect,
}: ApprovalModeRadioCardProps) {
  return (
    <label className={modeCardClassName(selected)}>
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={selected}
        onChange={() => onSelect(option.value)}
        className="mt-1 shrink-0 focus-visible:outline-none"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          {option.riskLabel}
        </div>
        <div className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{option.hint}</div>
      </div>
    </label>
  );
}
