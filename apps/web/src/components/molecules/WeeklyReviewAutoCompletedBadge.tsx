import { useId, useState } from 'react';

import { cn } from '@/lib/utils';
import { autoCompletedTooltipWithPoints } from '@/lib/weekly-review/auto-completed-tooltip';

export function WeeklyReviewAutoCompletedBadge({
  ritualPointsAwarded,
}: {
  ritualPointsAwarded?: number | null;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();
  const tooltip = autoCompletedTooltipWithPoints(ritualPointsAwarded);

  return (
    <div className="relative inline-block">
      <span
        tabIndex={0}
        role="status"
        aria-label="Auto-completed"
        aria-describedby={showTooltip ? tooltipId : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={cn(
          'inline-flex cursor-default items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          'text-slate-500 dark:text-slate-400',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50'
        )}
      >
        Auto-completed
      </span>
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
  );
}
