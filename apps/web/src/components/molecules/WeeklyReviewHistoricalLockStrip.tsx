import { useId, useState } from 'react';
import { Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

export type WeeklyReviewHistoricalLockVariant = 'historical' | 'locked';

const COPY: Record<
  WeeklyReviewHistoricalLockVariant,
  { label: string; tooltip: string; ariaLabel: string }
> = {
  historical: {
    label: 'Historical week · read-only',
    tooltip:
      'This snapshot is read-only. Numbers and AI text reflect the saved review, not live task completion.',
    ariaLabel: 'Historical week is read-only. Show details.',
  },
  locked: {
    label: 'Week locked in · read-only',
    tooltip: 'This week’s review is committed. Planning actions and sprint updates are closed.',
    ariaLabel: 'Week is locked in and read-only. Show details.',
  },
};

export interface WeeklyReviewHistoricalLockStripProps {
  variant: WeeklyReviewHistoricalLockVariant;
}

export function WeeklyReviewHistoricalLockStrip({ variant }: WeeklyReviewHistoricalLockStripProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();
  const { label, tooltip, ariaLabel } = COPY[variant];

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'sticky top-16 z-30 mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100/95 px-3 py-1.5 text-sm text-slate-700 backdrop-blur-sm',
        'dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 lg:top-4'
      )}
    >
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((prev) => !prev)}
          className="rounded p-0.5 text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-400 dark:hover:text-slate-200"
          aria-label={ariaLabel}
          aria-expanded={showTooltip}
          aria-describedby={showTooltip ? tooltipId : undefined}
        >
          <Lock className="h-4 w-4" aria-hidden />
        </button>
        {showTooltip ? (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute left-0 top-full z-40 mt-2 w-72 max-w-[min(18rem,90vw)] rounded-lg bg-gray-900 p-3 text-xs leading-relaxed text-white shadow-lg dark:bg-gray-700"
          >
            {tooltip}
          </div>
        ) : null}
      </div>
      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
    </div>
  );
}
