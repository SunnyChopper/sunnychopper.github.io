import type { ReactNode } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ProviderBrandBadge } from '@/components/atoms/ProviderBrandBadge';
import type { ObservabilityExecutionDetail } from '@/types/observability';
import { formatObservabilityUsd } from '@/lib/observability-formatters';
import { formatLatencyMs } from '@/utils/latency-formatters';
import {
  executionDetailStatusBadgeClassName,
  executionDetailStickyHeaderClassName,
} from '@/lib/observability/execution-detail-surfaces';
import { cn } from '@/lib/utils';

export type ExecutionDetailStickyHeaderProps = {
  detail: ObservabilityExecutionDetail;
  onOpenSandbox: () => void;
  sandboxPending?: boolean;
  sandboxError?: string | null;
  className?: string;
};

export default function ExecutionDetailStickyHeader({
  detail,
  onOpenSandbox,
  sandboxPending = false,
  sandboxError = null,
  className,
}: ExecutionDetailStickyHeaderProps) {
  const sandboxDisabled = detail.module !== 'assistant' || sandboxPending;

  return (
    <div className={cn(executionDetailStickyHeaderClassName, className)}>
      <StatusBadge
        status={detail.status}
        size="sm"
        className={executionDetailStatusBadgeClassName(detail.status)}
      />
      <ProviderBrandBadge providerId={detail.provider} size="sm" />
      <span
        className="max-w-[min(240px,40vw)] truncate font-mono text-xs text-gray-700 dark:text-gray-300"
        title={detail.model}
      >
        {detail.model}
      </span>
      <MetricChip label="Cost" value={formatObservabilityUsd(detail.totalCostUsd)} />
      <MetricChip label="Latency" value={formatLatencyMs(detail.latencyMs)} />
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {sandboxError ? (
          <span className="text-xs text-red-600 dark:text-red-400">{sandboxError}</span>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={sandboxDisabled}
          title={
            detail.module !== 'assistant'
              ? 'Only assistant module executions can open in sandbox'
              : 'Open captured prompt in interactive sandbox'
          }
          onClick={onOpenSandbox}
        >
          {sandboxPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="mr-1 h-4 w-4" />
          )}
          Open in Sandbox
        </Button>
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <span className="inline-flex items-baseline gap-1 text-xs tabular-nums text-gray-500 dark:text-gray-400">
      <span className="font-medium text-gray-600 dark:text-gray-300">{label}</span>
      {value}
    </span>
  );
}
