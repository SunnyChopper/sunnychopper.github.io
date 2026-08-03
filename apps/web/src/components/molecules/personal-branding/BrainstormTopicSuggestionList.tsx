import { useCallback, useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { selectableChipClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import { statusPillClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import { cn } from '@/lib/utils';
import type { TopicSuggestion } from '@/types/api/personal-branding.dto';

export interface BrainstormTopicSuggestionListProps {
  suggestions: TopicSuggestion[];
  selectedTopics: Set<string>;
  onToggle: (topic: string) => void;
  disabled?: boolean;
}

function WhyTopicPopover({
  suggestion,
  disabled,
}: {
  suggestion: TopicSuggestion;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label="Why this topic?"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <CircleHelp className="size-3" aria-hidden />
        Why?
      </button>
      {open ? (
        <div
          id={popoverId}
          role="tooltip"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border border-gray-200 bg-white p-2 text-left shadow-lg dark:border-gray-600 dark:bg-gray-900"
        >
          <p className="text-[11px] leading-snug text-gray-700 dark:text-gray-200">
            {suggestion.why}
          </p>
          {suggestion.matchedPillars.length > 0 ? (
            <ul className="mt-1.5 flex flex-wrap gap-1" role="list">
              {suggestion.matchedPillars.map((pillar) => (
                <li key={pillar}>
                  <span className={cn(statusPillClassName('neutral'), 'text-[10px]')}>
                    {pillar}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}

export default function BrainstormTopicSuggestionList({
  suggestions,
  selectedTopics,
  onToggle,
  disabled = false,
}: BrainstormTopicSuggestionListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const focusOptionAt = useCallback((index: number) => {
    const options = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-topic-option]');
    options?.[index]?.focus();
  }, []);

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const options = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-topic-option]');
    if (!options?.length) return;

    const currentIndex = Array.from(options).findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, options.length - 1);
      focusOptionAt(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex <= 0 ? 0 : currentIndex - 1;
      focusOptionAt(prev);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-multiselectable="true"
      aria-label="Brainstormed topic suggestions"
      className="mt-2 space-y-1"
      onKeyDown={handleListKeyDown}
    >
      {suggestions.map((suggestion, index) => {
        const isSelected = selectedTopics.has(suggestion.topic);
        return (
          <div
            key={suggestion.topic}
            role="presentation"
            className={cn(
              'flex items-start gap-1.5 rounded-lg border px-2 py-1.5 transition-colors',
              isSelected
                ? 'border-blue-500 bg-blue-50/80 dark:border-blue-400 dark:bg-blue-950/30'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
            )}
          >
            <button
              type="button"
              data-topic-option
              role="option"
              aria-selected={isSelected}
              disabled={disabled}
              onClick={() => onToggle(suggestion.topic)}
              className={cn(
                selectableChipClassName(
                  isSelected,
                  'flex-1 rounded-md border-0 bg-transparent px-1 py-0.5 text-left text-xs shadow-none'
                ),
                'whitespace-normal'
              )}
              tabIndex={index === 0 ? 0 : -1}
            >
              {suggestion.topic}
            </button>
            <WhyTopicPopover suggestion={suggestion} disabled={disabled} />
          </div>
        );
      })}
    </div>
  );
}
