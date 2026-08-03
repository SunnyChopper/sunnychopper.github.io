import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  groupPastReviewsByMonth,
  resolvePastReviewTriggerLabel,
  type PastReviewMenuItem,
} from '@/lib/growth-system/past-reviews-dropdown';
import type { WeeklyReview } from '@/types/growth-system';

type ReviewRow = Pick<WeeklyReview, 'weekStart' | 'status' | 'autoCompleted'>;

export interface PastReviewsDropdownProps {
  reviews: ReviewRow[];
  anchorWeekStart: string | null;
  value: string;
  onChange: (weekStart: string | null) => void;
  className?: string;
}

type FlatOption =
  | { kind: 'current'; value: '' }
  | { kind: 'review'; value: string; item: PastReviewMenuItem };

function buildFlatOptions(groups: ReturnType<typeof groupPastReviewsByMonth>): FlatOption[] {
  const options: FlatOption[] = [{ kind: 'current', value: '' }];
  for (const group of groups) {
    for (const item of group.items) {
      options.push({ kind: 'review', value: item.weekStart, item });
    }
  }
  return options;
}

export function PastReviewsDropdown({
  reviews,
  anchorWeekStart,
  value,
  onChange,
  className,
}: PastReviewsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const monthGroups = useMemo(
    () => groupPastReviewsByMonth(reviews, anchorWeekStart),
    [reviews, anchorWeekStart]
  );
  const flatOptions = useMemo(() => buildFlatOptions(monthGroups), [monthGroups]);
  const triggerLabel = resolvePastReviewTriggerLabel(value, reviews, anchorWeekStart);

  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        flatOptions.findIndex((opt) => opt.value === value)
      ),
    [flatOptions, value]
  );

  useEffect(() => {
    if (open) {
      setHighlight(selectedIndex);
    }
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectOption = useCallback(
    (option: FlatOption) => {
      onChange(option.value || null);
      setOpen(false);
    },
    [onChange]
  );

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (flatOptions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((h) => Math.min(flatOptions.length - 1, h + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = flatOptions[highlight];
      if (option) selectOption(option);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setHighlight(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setHighlight(flatOptions.length - 1);
    }
  };

  useEffect(() => {
    if (!open || !listboxRef.current) return;
    const active = listboxRef.current.querySelector<HTMLElement>(
      `[data-option-index="${highlight}"]`
    );
    if (typeof active?.scrollIntoView === 'function') {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [highlight, open]);

  return (
    <div className={cn('relative min-w-[220px]', className)} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-2 text-left text-sm text-gray-900',
          'transition hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
          'dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500'
        )}
      >
        <span className="truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-500 transition dark:text-gray-400',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          ref={listboxRef}
          id={listId}
          role="listbox"
          aria-label="Past reviews"
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className={cn(
            'absolute right-0 z-50 mt-1 max-h-80 w-full min-w-[280px] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white py-1 shadow-xl',
            'focus-visible:outline-none dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              data-option-index={0}
              onClick={() => selectOption({ kind: 'current', value: '' })}
              className={cn(
                'flex w-full flex-col px-3 py-2 text-left text-sm transition',
                highlight === 0
                  ? 'bg-blue-50 dark:bg-blue-950/40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                value === '' && 'font-medium text-blue-700 dark:text-blue-300'
              )}
            >
              <span>Current / auto</span>
            </button>
          </li>

          {monthGroups.map((group) => (
            <li key={group.monthKey} role="presentation">
              <div
                className={cn(
                  'sticky top-0 z-10 border-b border-gray-100 bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm',
                  'dark:border-gray-700 dark:bg-gray-800/95 dark:text-gray-400'
                )}
              >
                {group.monthLabel}
              </div>
              <ul role="group" aria-label={group.monthLabel}>
                {group.items.map((item) => {
                  const optionIndex = flatOptions.findIndex(
                    (opt) => opt.kind === 'review' && opt.value === item.weekStart
                  );
                  const isSelected = value === item.weekStart;
                  const isHighlighted = highlight === optionIndex;

                  return (
                    <li key={item.weekStart} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        data-option-index={optionIndex}
                        onClick={() =>
                          selectOption({ kind: 'review', value: item.weekStart, item })
                        }
                        className={cn(
                          'flex w-full flex-col gap-0.5 px-3 py-2 text-left transition',
                          isHighlighted
                            ? 'bg-blue-50 dark:bg-blue-950/40'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                          isSelected && 'font-medium'
                        )}
                      >
                        <span
                          className={cn(
                            'text-sm text-gray-900 dark:text-gray-100',
                            isSelected && 'text-blue-700 dark:text-blue-300'
                          )}
                        >
                          {item.primaryLabel}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.secondaryLabel}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
