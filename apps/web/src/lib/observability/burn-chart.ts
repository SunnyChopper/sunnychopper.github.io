import type { ObservabilityBurnPoint } from '@/types/observability';
import { formatObservabilityUsd } from '@/lib/observability-formatters';

export type BurnBarMetrics = {
  maxCost: number;
  maxTokens: number;
  useCostScale: boolean;
};

export function computeBurnBarMetrics(points: ObservabilityBurnPoint[]): BurnBarMetrics {
  const maxCost = Math.max(0, ...points.map((p) => p.totalCostUsd));
  const maxTokens = Math.max(1, ...points.map((p) => p.totalTokens));
  return {
    maxCost,
    maxTokens,
    useCostScale: maxCost > 0,
  };
}

export function burnBarHeightPercent(
  point: ObservabilityBurnPoint,
  metrics: BurnBarMetrics
): number {
  if (metrics.useCostScale) {
    return (point.totalCostUsd / metrics.maxCost) * 100;
  }
  return (point.totalTokens / metrics.maxTokens) * 100;
}

export type BurnSpikeAnalysis = {
  spikeIndices: Set<number>;
  latestSpikeMessage: string | null;
};

function formatBucketLabel(bucketStart: string): string {
  const d = new Date(bucketStart);
  if (Number.isNaN(d.getTime())) return bucketStart;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function analyzeBurnSpikes(points: ObservabilityBurnPoint[]): BurnSpikeAnalysis {
  const spikeIndices = new Set<number>();

  for (let i = 1; i < points.length; i++) {
    const prev = points.slice(0, i);
    const avg = prev.reduce((sum, p) => sum + p.totalCostUsd, 0) / prev.length;
    if (avg > 0 && points[i].totalCostUsd > avg * 2) {
      spikeIndices.add(i);
    }
  }

  let latestSpikeMessage: string | null = null;
  if (points.length >= 3) {
    const lastIdx = points.length - 1;
    const last = points[lastIdx];
    const prev = points.slice(0, -1);
    const avg = prev.reduce((sum, p) => sum + p.totalCostUsd, 0) / prev.length;
    if (avg > 0 && last.totalCostUsd > avg * 2) {
      const multiplier = last.totalCostUsd / avg;
      latestSpikeMessage =
        `Recent spend spike: ${formatBucketLabel(last.bucketStart)} ` +
        `${formatObservabilityUsd(last.totalCostUsd)} is ${multiplier.toFixed(1)}× the trailing ` +
        `${prev.length}-day average (${formatObservabilityUsd(avg)}).`;
    }
  }

  return { spikeIndices, latestSpikeMessage };
}

/** Indices to show date labels under the chart (first, last, ~weekly). */
export function burnChartTickIndices(pointCount: number): Set<number> {
  if (pointCount <= 0) return new Set();
  if (pointCount <= 7) return new Set(pointsRange(pointCount));

  const ticks = new Set<number>([0, pointCount - 1]);
  const step = Math.max(1, Math.round(pointCount / 6));
  for (let i = step; i < pointCount - 1; i += step) {
    ticks.add(i);
  }
  return ticks;
}

function pointsRange(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

export function toUtcDateKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export type TodayCostTrend = {
  deltaUsd: number;
  deltaPct: number | null;
  direction: 'up' | 'down' | 'flat';
};

/** Client-derived day-over-day trend for Today USD from timeseries buckets. */
export function deriveTodayCostTrend(
  points: ObservabilityBurnPoint[],
  todayCostUsd: number,
  nowUtc: Date = new Date()
): TodayCostTrend | null {
  if (points.length === 0) return null;

  const yesterday = new Date(nowUtc);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  const bucketKeys = points.map((p) => toUtcDateKey(p.bucketStart));
  const minKey = bucketKeys[0]!;
  const maxKey = bucketKeys[bucketKeys.length - 1]!;

  if (yesterdayKey < minKey || yesterdayKey > maxKey) {
    return null;
  }

  const yesterdayPoint = points.find((p) => toUtcDateKey(p.bucketStart) === yesterdayKey);
  const yesterdayCost = yesterdayPoint?.totalCostUsd ?? 0;

  const deltaUsd = todayCostUsd - yesterdayCost;
  let deltaPct: number | null = null;
  if (yesterdayCost > 0) {
    deltaPct = (deltaUsd / yesterdayCost) * 100;
  }

  let direction: TodayCostTrend['direction'] = 'flat';
  if (deltaUsd > 0.000_05) direction = 'up';
  else if (deltaUsd < -0.000_05) direction = 'down';

  return { deltaUsd, deltaPct, direction };
}

export type BurnYTick = {
  value: number;
  label: string;
};

export function computeBurnYTicks(metrics: BurnBarMetrics): BurnYTick[] {
  if (metrics.useCostScale) {
    const max = metrics.maxCost;
    const mid = max / 2;
    return [
      { value: max, label: formatObservabilityUsd(max) },
      { value: mid, label: formatObservabilityUsd(mid) },
      { value: 0, label: formatObservabilityUsd(0) },
    ];
  }

  const max = metrics.maxTokens;
  const mid = Math.round(max / 2);
  return [
    { value: max, label: max.toLocaleString('en-US') },
    { value: mid, label: mid.toLocaleString('en-US') },
    { value: 0, label: '0' },
  ];
}

export type BurnTooltipPlacement = 'center' | 'start' | 'end';

/** Edge-aware tooltip placement so first/last bars do not clip the panel. */
export function burnTooltipPlacement(barIndex: number, barCount: number): BurnTooltipPlacement {
  if (barCount <= 1) return 'center';
  const ratio = barIndex / (barCount - 1);
  if (ratio <= 0.15) return 'start';
  if (ratio >= 0.85) return 'end';
  return 'center';
}

export const burnTooltipPlacementClassName: Record<BurnTooltipPlacement, string> = {
  center: 'left-1/2 -translate-x-1/2',
  start: 'left-0 translate-x-0',
  end: 'left-auto right-0 translate-x-0',
};

export function formatBurnBucketLabel(bucketStart: string): string {
  const d = new Date(bucketStart);
  if (Number.isNaN(d.getTime())) return bucketStart;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatBurnBucketShortLabel(bucketStart: string): string {
  const d = new Date(bucketStart);
  if (Number.isNaN(d.getTime())) return bucketStart;
  return d
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    .replace(/, \d{4}$/, '');
}
