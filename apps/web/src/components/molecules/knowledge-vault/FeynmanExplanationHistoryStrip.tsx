import { truncateExplanationChipLabel } from '@/lib/knowledge-vault/feynman-explanation-history';
import { cn } from '@/lib/utils';

export type FeynmanExplanationHistoryStripProps = {
  explanations: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
};

export function FeynmanExplanationHistoryStrip({
  explanations,
  onSelect,
  disabled = false,
}: FeynmanExplanationHistoryStripProps) {
  if (explanations.length === 0) return null;

  return (
    <div
      className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
      data-testid="feynman-explanation-history"
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
        Recent explanations
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {explanations.map((text, index) => {
          const label = truncateExplanationChipLabel(text);
          return (
            <button
              key={`${index}-${text.slice(0, 24)}`}
              type="button"
              disabled={disabled}
              title={text}
              aria-label={`Restore explanation ${index + 1}: ${text}`}
              onClick={() => onSelect(text)}
              className={cn(
                'shrink-0 max-w-[min(12rem,40vw)] rounded-full border border-gray-200 dark:border-gray-600',
                'bg-gray-50 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors truncate',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
