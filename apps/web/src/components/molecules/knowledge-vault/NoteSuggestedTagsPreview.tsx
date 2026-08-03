import { Check, Tag } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { AIConfidenceIndicator } from '@/components/atoms/AIConfidenceIndicator';
import {
  countHighConfidenceNovelTags,
  normalizeSuggestedTagLabel,
  relevanceToPercent,
  type SuggestedTagRow,
} from '@/lib/knowledge-vault/note-suggest-tags';
import { cn } from '@/lib/utils';

interface NoteSuggestedTagsPreviewProps {
  suggestions: SuggestedTagRow[];
  appliedTags: string[];
  onToggleTag: (tag: string) => void;
  onApplyHighConfidence: () => void;
  disabled?: boolean;
}

export function NoteSuggestedTagsPreview({
  suggestions,
  appliedTags,
  onToggleTag,
  onApplyHighConfidence,
  disabled = false,
}: NoteSuggestedTagsPreviewProps) {
  const appliedSet = new Set(appliedTags.map(normalizeSuggestedTagLabel));
  const highConfidenceCount = countHighConfidenceNovelTags(suggestions, appliedTags);

  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 space-y-3">
      <div className="flex items-center gap-2">
        <Tag size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Suggested tags</span>
      </div>

      <div className="space-y-2">
        {suggestions.map((item) => {
          const isApplied = appliedSet.has(item.tag);
          return (
            <button
              key={item.tag}
              type="button"
              title={item.reasoning}
              disabled={disabled}
              onClick={() => onToggleTag(item.tag)}
              className={cn(
                'w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left transition',
                'border',
                isApplied
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isApplied && (
                  <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium truncate',
                    isApplied ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'
                  )}
                >
                  {item.tag}
                </span>
              </div>
              <AIConfidenceIndicator
                confidence={relevanceToPercent(item.relevance)}
                size="sm"
                className="shrink-0"
              />
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={onApplyHighConfidence}
        disabled={disabled || highConfidenceCount === 0}
        className="w-full"
      >
        <Check className="w-4 h-4 mr-1" />
        Apply all high-confidence
        {highConfidenceCount > 0 ? ` (${highConfidenceCount})` : ''}
      </Button>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Tap a tag to add or remove. Bulk apply uses tags at 70% confidence or higher.
      </p>
    </div>
  );
}
