import { useEffect, useRef, useState } from 'react';

import { plannerEmptyCapacityLabelClassName } from '@/lib/planner/planner-surfaces';
import type { PlannerCapacityState } from '@/types/planner';

const CAPACITY_LABEL: Record<PlannerCapacityState, string> = {
  healthy: 'Capacity',
  warning: 'Near capacity',
  overloaded: 'Over capacity',
  blocked: 'Unavailable',
};

const CAPACITY_CLASS: Record<PlannerCapacityState, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  overloaded: 'bg-red-500',
  blocked: 'bg-slate-500',
};

export interface PlannerCapacityMeterProps {
  loadRatio: number;
  capacityState: PlannerCapacityState;
  scheduledPoints: number;
  capacityPoints: number;
  className?: string;
  variant?: 'default' | 'empty';
}

export function PlannerCapacityMeter({
  loadRatio,
  capacityState,
  scheduledPoints,
  capacityPoints,
  className = '',
  variant = 'default',
}: PlannerCapacityMeterProps) {
  const isBlocked = capacityState === 'blocked' || capacityPoints <= 0;
  const pct = isBlocked ? 0 : Math.min(100, Math.round(loadRatio * 100));
  const isEmptyVariant = variant === 'empty';
  const [displayedPct, setDisplayedPct] = useState(0);
  const hasPrimedFill = useRef(false);

  useEffect(() => {
    if (isEmptyVariant || pct <= 0) {
      setDisplayedPct(0);
      hasPrimedFill.current = false;
      return;
    }

    if (!hasPrimedFill.current) {
      hasPrimedFill.current = true;
      setDisplayedPct(0);
      const frameId = requestAnimationFrame(() => {
        setDisplayedPct(pct);
      });
      return () => {
        cancelAnimationFrame(frameId);
      };
    }

    setDisplayedPct(pct);
  }, [isEmptyVariant, pct]);

  const labelClassName = isEmptyVariant
    ? `text-xs ${plannerEmptyCapacityLabelClassName}`
    : 'text-xs text-gray-600 dark:text-gray-400';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className={`flex justify-between ${labelClassName}`}>
        <span>{CAPACITY_LABEL[capacityState] ?? CAPACITY_LABEL.blocked}</span>
        <span>
          {isBlocked
            ? '0 pts capacity'
            : `${scheduledPoints.toFixed(1)} / ${capacityPoints.toFixed(1)} pts`}
        </span>
      </div>
      {!isEmptyVariant ? (
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            data-testid="planner-capacity-fill"
            className={`h-full transition-[width] duration-200 ease-out motion-reduce:transition-none ${CAPACITY_CLASS[capacityState]}`}
            style={{ width: `${displayedPct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
