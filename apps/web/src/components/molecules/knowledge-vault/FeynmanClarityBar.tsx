import { useEffect, useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProgressRing } from '@/components/atoms/ProgressRing';
import { clarityRingColor, toClarityPercent } from '@/lib/knowledge-vault/feynman-clarity';
import type { FeynmanJargonHighlight } from '@/types/knowledge-vault';
import { cn } from '@/lib/utils';

export type FeynmanClarityBarProps = {
  clarityScore: number | null;
  jargonHighlights: FeynmanJargonHighlight[];
  /** Bump when a new respond lands to reset jargon expand state. */
  feedbackVersion: number;
};

export function FeynmanClarityBar({
  clarityScore,
  jargonHighlights,
  feedbackVersion,
}: FeynmanClarityBarProps) {
  const percent = toClarityPercent(clarityScore);
  const ringColor = clarityRingColor(percent);
  const jargonCount = jargonHighlights.length;
  const [jargonExpanded, setJargonExpanded] = useState(false);
  const jargonPanelId = useId();

  useEffect(() => {
    setJargonExpanded(false);
  }, [feedbackVersion]);

  useEffect(() => {
    if (jargonCount === 0) {
      setJargonExpanded(false);
    }
  }, [jargonCount]);

  return (
    <div
      className="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50"
      data-testid="feynman-clarity-bar"
    >
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="relative shrink-0">
          <ProgressRing
            progress={percent ?? 0}
            size="sm"
            showLabel={percent != null}
            color={ringColor}
          />
          {percent == null && (
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-400 dark:text-gray-500"
              aria-hidden
            >
              —
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Clarity score</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 tabular-nums">
            {percent != null ? `${percent}%` : 'Submit an explanation to score'}
          </p>
        </div>
        {jargonCount > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200/80 dark:hover:bg-amber-900/60 transition-colors"
            aria-expanded={jargonExpanded}
            aria-controls={jargonPanelId}
            onClick={() => setJargonExpanded((open) => !open)}
          >
            Jargon to simplify: {jargonCount}
            <ChevronDown
              className={cn('w-3.5 h-3.5 transition-transform', jargonExpanded && 'rotate-180')}
              aria-hidden
            />
          </button>
        )}
      </div>
      {jargonExpanded && jargonCount > 0 && (
        <ul
          id={jargonPanelId}
          className="max-h-32 overflow-y-auto border-t border-gray-200 dark:border-gray-700 px-3 py-2 space-y-2 text-xs"
        >
          {jargonHighlights.map((item, index) => (
            <li
              key={`${item.term}-${index}`}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
            >
              <span className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-950 dark:text-yellow-50 px-1.5 py-0.5 rounded font-medium">
                {item.term}
              </span>
              {item.note ? (
                <span className="text-gray-600 dark:text-gray-400">{item.note}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
