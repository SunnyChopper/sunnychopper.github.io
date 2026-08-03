import { describe, expect, it } from 'vitest';
import {
  analyzeBurnSpikes,
  burnBarHeightPercent,
  burnChartTickIndices,
  burnTooltipPlacement,
  computeBurnBarMetrics,
  computeBurnYTicks,
  deriveTodayCostTrend,
} from './burn-chart';
import type { ObservabilityBurnPoint } from '@/types/observability';

function point(
  bucketStart: string,
  totalCostUsd: number,
  totalTokens = 1000
): ObservabilityBurnPoint {
  return {
    bucketStart,
    totalCostUsd,
    inputTokens: totalTokens / 2,
    outputTokens: totalTokens / 2,
    totalTokens,
    callCount: 1,
  };
}

describe('burn-chart helpers', () => {
  it('scales bars by USD when costs are present', () => {
    const points = [point('2026-07-20', 1), point('2026-07-21', 2)];
    const metrics = computeBurnBarMetrics(points);
    expect(metrics.useCostScale).toBe(true);
    expect(burnBarHeightPercent(points[1], metrics)).toBe(100);
    expect(burnBarHeightPercent(points[0], metrics)).toBe(50);
  });

  it('detects spike indices and message', () => {
    const points = [point('2026-07-20', 1), point('2026-07-21', 1), point('2026-07-22', 5)];
    const { spikeIndices, latestSpikeMessage } = analyzeBurnSpikes(points);
    expect(spikeIndices.has(2)).toBe(true);
    expect(latestSpikeMessage).toMatch(/Recent spend spike/);
    expect(latestSpikeMessage).toMatch(/5\.0×|5×/);
  });

  it('returns tick indices for long series', () => {
    const ticks = burnChartTickIndices(30);
    expect(ticks.has(0)).toBe(true);
    expect(ticks.has(29)).toBe(true);
    expect(ticks.size).toBeGreaterThan(2);
  });

  it('derives today cost trend when yesterday is in window', () => {
    const points = [point('2026-07-22T00:00:00.000Z', 1), point('2026-07-23T00:00:00.000Z', 0.5)];
    const now = new Date('2026-07-23T12:00:00.000Z');
    const trend = deriveTodayCostTrend(points, 2, now);
    expect(trend).not.toBeNull();
    expect(trend!.deltaUsd).toBe(1);
    expect(trend!.direction).toBe('up');
    expect(trend!.deltaPct).toBe(100);
  });

  it('returns null when yesterday is outside loaded window', () => {
    const points = [point('2026-07-20T00:00:00.000Z', 1)];
    const now = new Date('2026-07-23T12:00:00.000Z');
    expect(deriveTodayCostTrend(points, 1, now)).toBeNull();
  });

  it('treats missing yesterday bucket as zero when in span', () => {
    const points = [point('2026-07-21T00:00:00.000Z', 1), point('2026-07-23T00:00:00.000Z', 0.5)];
    const now = new Date('2026-07-23T12:00:00.000Z');
    const trend = deriveTodayCostTrend(points, 0.75, now);
    expect(trend).not.toBeNull();
    expect(trend!.deltaUsd).toBe(0.75);
    expect(trend!.direction).toBe('up');
  });

  it('computes y-axis ticks for cost scale', () => {
    const metrics = computeBurnBarMetrics([point('2026-07-20', 4), point('2026-07-21', 2)]);
    const ticks = computeBurnYTicks(metrics);
    expect(ticks).toHaveLength(3);
    expect(ticks[0]!.value).toBe(4);
    expect(ticks[2]!.value).toBe(0);
  });

  it('places tooltip at edges for first and last bars', () => {
    expect(burnTooltipPlacement(0, 10)).toBe('start');
    expect(burnTooltipPlacement(9, 10)).toBe('end');
    expect(burnTooltipPlacement(5, 10)).toBe('center');
  });
});
