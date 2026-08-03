import { useMemo, useState } from 'react';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
  analyzeBurnSpikes,
  burnBarHeightPercent,
  burnChartTickIndices,
  burnTooltipPlacement,
  burnTooltipPlacementClassName,
  computeBurnBarMetrics,
  computeBurnYTicks,
  formatBurnBucketLabel,
  formatBurnBucketShortLabel,
} from '@/lib/observability/burn-chart';
import {
  burnChartBarsClassName,
  burnChartCardClassName,
  burnChartMaxAnnotationClassName,
  burnChartPlotClassName,
  burnChartShellClassName,
  burnChartSkeletonBarsClassName,
  burnChartXTickClassName,
  burnChartYAxisClassName,
  burnTooltipPanelClassName,
} from '@/lib/observability/burn-surfaces';
import {
  formatObservabilityTokenCount,
  formatObservabilityUsd,
} from '@/lib/observability-formatters';
import { cn } from '@/lib/utils';
import type { ObservabilityBurnPoint } from '@/types/observability';

export type BurnDailyChartProps = {
  points: ObservabilityBurnPoint[];
  isLoading: boolean;
  isError: boolean;
};

function BurnDailyTooltip({
  point,
  placement,
}: {
  point: ObservabilityBurnPoint;
  placement: ReturnType<typeof burnTooltipPlacement>;
}) {
  return (
    <div
      className={cn(burnTooltipPanelClassName, burnTooltipPlacementClassName[placement])}
      role="tooltip"
    >
      <div className="font-semibold text-gray-900 dark:text-white">
        {formatBurnBucketLabel(point.bucketStart)}
      </div>
      <dl className="mt-1 space-y-0.5 text-gray-600 tabular-nums dark:text-gray-300">
        <div className="flex justify-between gap-4">
          <dt>Cost</dt>
          <dd>{formatObservabilityUsd(point.totalCostUsd)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Input tokens</dt>
          <dd>{formatObservabilityTokenCount(point.inputTokens)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Output tokens</dt>
          <dd>{formatObservabilityTokenCount(point.outputTokens)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Total tokens</dt>
          <dd>{formatObservabilityTokenCount(point.totalTokens)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Calls</dt>
          <dd>{point.callCount.toLocaleString()}</dd>
        </div>
      </dl>
    </div>
  );
}

function BurnChartSkeleton() {
  const heights = [35, 55, 28, 72, 45, 60, 38, 80, 50, 42, 65, 30];
  return (
    <div className={burnChartSkeletonBarsClassName} aria-hidden>
      {heights.map((h, i) => (
        <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
          <div className="w-full" style={{ height: `${h}%` }}>
            <Skeleton className="h-full w-full rounded-t" variant="rectangular" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BurnDailyChart({ points, isLoading, isError }: BurnDailyChartProps) {
  const [hoveredBurnIndex, setHoveredBurnIndex] = useState<number | null>(null);

  const prefersReducedMotion = useMemo(() => {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  const burnBarMetrics = useMemo(() => computeBurnBarMetrics(points), [points]);
  const burnSpikeAnalysis = useMemo(() => analyzeBurnSpikes(points), [points]);
  const burnTickIndices = useMemo(() => burnChartTickIndices(points.length), [points.length]);
  const yTicks = useMemo(() => computeBurnYTicks(burnBarMetrics), [burnBarMetrics]);

  return (
    <div className={burnChartCardClassName}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Burn (daily)</h3>
        {burnBarMetrics.useCostScale && !isLoading && points.length > 0 ? (
          <span className={burnChartMaxAnnotationClassName}>
            max {formatObservabilityUsd(burnBarMetrics.maxCost)}
          </span>
        ) : null}
      </div>

      {isLoading && points.length === 0 ? (
        <BurnChartSkeleton />
      ) : isError ? (
        <p className="text-sm text-red-600">Failed to load timeseries.</p>
      ) : points.length === 0 ? (
        <p className="text-sm text-gray-500">No execution data in this window yet.</p>
      ) : (
        <>
          <div className={burnChartShellClassName}>
            <div className={burnChartYAxisClassName} aria-hidden>
              {yTicks.map((tick) => (
                <span key={tick.value}>{tick.label}</span>
              ))}
            </div>
            <div className={burnChartPlotClassName}>
              <div
                className={burnChartBarsClassName}
                onMouseLeave={() => setHoveredBurnIndex(null)}
              >
                {points.map((p, idx) => (
                  <div
                    key={p.bucketStart}
                    className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                    onMouseEnter={() => setHoveredBurnIndex(idx)}
                    onFocus={() => setHoveredBurnIndex(idx)}
                    onBlur={() => setHoveredBurnIndex(null)}
                    role="presentation"
                    tabIndex={-1}
                  >
                    {hoveredBurnIndex === idx && (
                      <BurnDailyTooltip
                        point={p}
                        placement={burnTooltipPlacement(idx, points.length)}
                      />
                    )}
                    <div
                      className={cn(
                        'mx-auto w-full max-w-[12px] rounded-t motion-reduce:transition-none',
                        !prefersReducedMotion && 'transition-opacity',
                        burnSpikeAnalysis.spikeIndices.has(idx)
                          ? 'bg-amber-500/90 dark:bg-amber-400/90'
                          : 'bg-violet-500/90 dark:bg-violet-400/90',
                        !prefersReducedMotion &&
                          hoveredBurnIndex != null &&
                          hoveredBurnIndex !== idx &&
                          'opacity-40'
                      )}
                      style={{
                        height: `${burnBarHeightPercent(p, burnBarMetrics)}%`,
                        minHeight: 2,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-1 flex gap-0.5 pl-10">
            {points.map((p, idx) => (
              <div key={`tick-${p.bucketStart}`} className="min-w-0 flex-1 text-center">
                {burnTickIndices.has(idx) ? (
                  <span className={burnChartXTickClassName}>
                    {formatBurnBucketShortLabel(p.bucketStart)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
