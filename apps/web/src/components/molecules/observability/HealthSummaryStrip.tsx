import { Select } from '@/components/atoms/Select';
import { Skeleton } from '@/components/atoms/Skeleton';
import {
  formatHealthSummaryFailureAt,
  healthSummaryMetricLabelClassName,
  healthSummaryMetricValueClassName,
  healthSummaryMetricValueDangerClassName,
  healthSummaryStripClassName,
} from '@/lib/observability/health-row';
import { cn } from '@/lib/utils';
import type { ObservabilityHealthSummary } from '@/types/observability';

export type HealthSummaryStripProps = {
  sinceDays: number;
  onSinceDaysChange: (days: number) => void;
  summary: ObservabilityHealthSummary | undefined;
  isLoading?: boolean;
  className?: string;
};

function MetricCell({
  label,
  value,
  danger = false,
  loading = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className={healthSummaryMetricLabelClassName}>{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-12" variant="text" />
      ) : (
        <span
          className={
            danger ? healthSummaryMetricValueDangerClassName : healthSummaryMetricValueClassName
          }
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default function HealthSummaryStrip({
  sinceDays,
  onSinceDaysChange,
  summary,
  isLoading = false,
  className,
}: HealthSummaryStripProps) {
  const failureCount = summary?.failureCount ?? 0;
  const hasFailures = failureCount > 0;

  return (
    <div
      className={cn(healthSummaryStripClassName, className)}
      aria-label="Automation health summary"
    >
      <div className="flex flex-col gap-0.5">
        <span className={healthSummaryMetricLabelClassName}>Since</span>
        <Select
          className="w-auto min-w-[7rem] rounded border border-gray-300/80 bg-white px-2 py-1 text-sm dark:border-gray-600/70 dark:bg-gray-900/80"
          value={sinceDays}
          onChange={(e) => onSinceDaysChange(Number(e.target.value))}
          aria-label="Since days"
          disabled={isLoading}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
        </Select>
      </div>

      <MetricCell label="Runs" value={summary?.totalRuns ?? 0} loading={isLoading} />
      <MetricCell label="Failures" value={failureCount} danger={hasFailures} loading={isLoading} />
      <MetricCell
        label="Last failure"
        value={formatHealthSummaryFailureAt(summary?.lastFailureAt)}
        danger={hasFailures && Boolean(summary?.lastFailureAt)}
        loading={isLoading}
      />
    </div>
  );
}
