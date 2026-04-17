import { useMemo } from 'react';
import type { WeeklyReviewVelocityWeek } from '@/types/growth-system';
import { cn } from '@/lib/utils';

interface VelocityChartProps {
  /** Newest week first (index 0 = current). */
  weeks: WeeklyReviewVelocityWeek[];
  /** Trailing average story points (e.g. prior 4 weeks). */
  trailingAverage: number;
  /** Highlight label for the latest week column. */
  currentWeekStart: string;
  className?: string;
}

export function VelocityChart({
  weeks,
  trailingAverage,
  currentWeekStart,
  className,
}: VelocityChartProps) {
  const ordered = useMemo(() => [...weeks].reverse(), [weeks]);
  const maxY = useMemo(() => {
    const vals = ordered.map((w) => w.storyPointsCompleted);
    const m = Math.max(...vals, trailingAverage, 1);
    return m * 1.15;
  }, [ordered, trailingAverage]);

  const w = 320;
  const h = 140;
  const pad = 28;
  const barW = (w - pad * 2) / Math.max(ordered.length, 1) - 4;

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-600 dark:bg-gray-900/60',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Story point velocity
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          4-wk avg:{' '}
          <span className="font-mono text-cyan-600 dark:text-cyan-400">
            {trailingAverage.toFixed(1)}
          </span>{' '}
          pts
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-md mx-auto"
        role="img"
        aria-label="Weekly story point velocity vs trailing average"
      >
        {/* trailing average line */}
        <line
          x1={pad}
          y1={h - pad - (trailingAverage / maxY) * (h - pad * 2)}
          x2={w - pad}
          y2={h - pad - (trailingAverage / maxY) * (h - pad * 2)}
          stroke="rgb(34 211 238)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          opacity={0.85}
        />
        {ordered.map((week, i) => {
          const x = pad + i * ((w - pad * 2) / ordered.length) + 2;
          const bh = (week.storyPointsCompleted / maxY) * (h - pad * 2);
          const isCurrent = week.weekStart === currentWeekStart;
          return (
            <g key={week.weekStart}>
              <rect
                x={x}
                y={h - pad - bh}
                width={barW}
                height={Math.max(bh, 2)}
                rx={3}
                fill={isCurrent ? 'rgb(59 130 246)' : 'rgb(51 65 85)'}
                opacity={isCurrent ? 1 : 0.85}
              />
              <text
                x={x + barW / 2}
                y={h - 6}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400"
                fontSize={9}
              >
                {week.weekStart.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
        Bars = completed story points per week · Dashed = trailing 4-week average
      </p>
    </div>
  );
}
