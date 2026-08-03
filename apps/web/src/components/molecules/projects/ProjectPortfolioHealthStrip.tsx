import { Skeleton } from '@/components/atoms/Skeleton';
import {
  portfolioHealthMetricLabelClassName,
  portfolioHealthMetricValueClassName,
  portfolioHealthOverdueValueClassName,
  portfolioHealthScoreValueClassName,
  portfolioHealthStaleValueClassName,
  portfolioHealthStripClassName,
} from '@/lib/projects/portfolio-health-surfaces';
import type { PortfolioBucketCounts } from '@/lib/projects/portfolio-health';
import { cn } from '@/lib/utils';

export type ProjectPortfolioHealthStripProps = {
  counts: PortfolioBucketCounts;
  portfolioHealthScore: number | null;
  isLoading?: boolean;
  className?: string;
};

function MetricCell({
  label,
  value,
  valueClassName,
  loading = false,
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex min-w-[4.5rem] flex-col gap-0.5">
      <span className={portfolioHealthMetricLabelClassName}>{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-10" variant="text" />
      ) : (
        <span className={cn(portfolioHealthMetricValueClassName, valueClassName)}>{value}</span>
      )}
    </div>
  );
}

export default function ProjectPortfolioHealthStrip({
  counts,
  portfolioHealthScore,
  isLoading = false,
  className,
}: ProjectPortfolioHealthStripProps) {
  const scoreLabel =
    portfolioHealthScore === null && !isLoading ? '—' : `${portfolioHealthScore ?? 0}%`;

  return (
    <div
      className={cn(portfolioHealthStripClassName, className)}
      aria-label="Portfolio health"
      role="region"
    >
      <MetricCell label="Active" value={counts.active} loading={isLoading} />
      <MetricCell label="Planning" value={counts.planning} loading={isLoading} />
      <MetricCell
        label="Stale"
        value={counts.stale}
        valueClassName={counts.stale > 0 ? portfolioHealthStaleValueClassName : undefined}
        loading={isLoading}
      />
      <MetricCell
        label="Overdue"
        value={counts.overdue}
        valueClassName={counts.overdue > 0 ? portfolioHealthOverdueValueClassName : undefined}
        loading={isLoading}
      />
      <div className="flex min-w-[6.5rem] flex-col gap-0.5 sm:ml-auto">
        <span className={portfolioHealthMetricLabelClassName}>Portfolio health</span>
        {isLoading ? (
          <Skeleton className="h-5 w-12" variant="text" />
        ) : (
          <span className={portfolioHealthScoreValueClassName(portfolioHealthScore)}>
            {scoreLabel}
          </span>
        )}
      </div>
    </div>
  );
}
