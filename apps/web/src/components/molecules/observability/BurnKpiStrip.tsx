import { useMemo } from 'react';
import { Skeleton } from '@/components/atoms/Skeleton';
import { deriveTodayCostTrend } from '@/lib/observability/burn-chart';
import {
  burnKpiCardClassName,
  burnKpiCardEmphasizedClassName,
  burnKpiGridClassName,
  burnKpiLabelClassName,
  burnKpiSubtitleClassName,
  burnKpiTrendDownClassName,
  burnKpiTrendFlatClassName,
  burnKpiTrendUpClassName,
  burnKpiValueEmphasizedClassName,
  burnKpiValueQuietClassName,
} from '@/lib/observability/burn-surfaces';
import {
  formatObservabilityTokenCount,
  formatObservabilityUsd,
} from '@/lib/observability-formatters';
import { cn } from '@/lib/utils';
import type { ObservabilityBurnPoint, ObservabilityBurnSummary } from '@/types/observability';
import { formatLatencyMs } from '@/utils/latency-formatters';

export type BurnKpiStripProps = {
  summary: ObservabilityBurnSummary | undefined;
  points: ObservabilityBurnPoint[];
  isLoading: boolean;
};

function formatTrendChip(trend: NonNullable<ReturnType<typeof deriveTodayCostTrend>>): string {
  const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
  const absUsd = formatObservabilityUsd(Math.abs(trend.deltaUsd));
  if (trend.deltaPct != null) {
    const pct = Math.abs(Math.round(trend.deltaPct));
    return `${arrow} ${absUsd} · ${pct}%`;
  }
  return `${arrow} ${absUsd}`;
}

function trendClassName(direction: 'up' | 'down' | 'flat'): string {
  if (direction === 'up') return burnKpiTrendUpClassName;
  if (direction === 'down') return burnKpiTrendDownClassName;
  return burnKpiTrendFlatClassName;
}

export default function BurnKpiStrip({ summary, points, isLoading }: BurnKpiStripProps) {
  const todayTrend = useMemo(() => {
    if (!summary) return null;
    return deriveTodayCostTrend(points, summary.todayCostUsd);
  }, [points, summary]);

  const failRateSubtitle = useMemo(() => {
    if (!summary || summary.totalCalls <= 0) return null;
    const pct = Math.round((100 * summary.failedExecutions) / summary.totalCalls);
    return `${pct}% fail rate in window`;
  }, [summary]);

  if (isLoading && !summary) {
    return (
      <div className={burnKpiGridClassName}>
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={i === 0 || i === 4 ? burnKpiCardEmphasizedClassName : burnKpiCardClassName}
          >
            <Skeleton className="h-3 w-20" variant="text" />
            <Skeleton className="mt-2 h-8 w-28" variant="rectangular" />
            {(i === 0 || i === 4) && <Skeleton className="mt-2 h-3 w-24" variant="text" />}
          </div>
        ))}
      </div>
    );
  }

  const cards: Array<{
    label: string;
    value: string;
    emphasized: boolean;
    subtitle?: string | null;
    subtitleClassName?: string;
  }> = [
    {
      label: 'Today (USD)',
      value: formatObservabilityUsd(summary?.todayCostUsd ?? 0),
      emphasized: true,
      subtitle: todayTrend ? formatTrendChip(todayTrend) : null,
      subtitleClassName: todayTrend ? trendClassName(todayTrend.direction) : undefined,
    },
    {
      label: 'Last 7d (USD)',
      value: formatObservabilityUsd(summary?.last7dCostUsd ?? 0),
      emphasized: false,
    },
    {
      label: 'Tokens',
      value: formatObservabilityTokenCount(summary?.totalTokens),
      emphasized: false,
    },
    {
      label: 'Avg latency (ms)',
      value: formatLatencyMs(summary?.avgLatencyMs),
      emphasized: false,
    },
    {
      label: 'Failures',
      value: `${summary?.failedExecutions ?? 0} / ${summary?.totalCalls ?? 0}`,
      emphasized: true,
      subtitle: failRateSubtitle,
    },
  ];

  return (
    <div className={burnKpiGridClassName}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={card.emphasized ? burnKpiCardEmphasizedClassName : burnKpiCardClassName}
        >
          <p className={burnKpiLabelClassName}>{card.label}</p>
          <p
            className={
              card.emphasized ? burnKpiValueEmphasizedClassName : burnKpiValueQuietClassName
            }
          >
            {card.value}
          </p>
          {card.subtitle ? (
            <p className={cn(burnKpiSubtitleClassName, card.subtitleClassName)}>{card.subtitle}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
