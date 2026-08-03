import type { ReactNode } from 'react';
import type { ObservabilityExecutionDetail } from '@/types/observability';
import {
  formatObservabilityTokenCount,
  formatObservabilityUsd,
  formatPromptTokenValue,
} from '@/lib/observability-formatters';
import { formatLatencyMs } from '@/utils/latency-formatters';
import {
  executionDetailMetricGridClassName,
  executionDetailMetricLabelClassName,
  executionDetailMetricSubRowClassName,
  executionDetailMetricTileClassName,
  executionDetailMetricValueClassName,
} from '@/lib/observability/execution-detail-surfaces';

const DETAIL_GRID_CLASS = 'grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2';

function DetailGrid({ fields }: { fields: { label: string; value: ReactNode; mono?: boolean }[] }) {
  return (
    <dl className={DETAIL_GRID_CLASS}>
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-gray-500">{field.label}</dt>
          <dd
            className={
              field.mono === false
                ? 'text-gray-900 dark:text-gray-100'
                : 'font-mono tabular-nums text-gray-900 dark:text-gray-100'
            }
          >
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function MetricTile({ label, rows }: { label: string; rows: ReactNode[] }) {
  return (
    <div className={executionDetailMetricTileClassName}>
      <div className={executionDetailMetricLabelClassName}>{label}</div>
      <div className={executionDetailMetricValueClassName}>
        {rows.map((row, index) => (
          <span
            key={index}
            className={index === 0 ? 'block' : executionDetailMetricSubRowClassName}
          >
            {row}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ExecutionDetailOverview({
  detail,
}: {
  detail: ObservabilityExecutionDetail;
}) {
  const tokenRows = [
    <>In: {formatPromptTokenValue(detail.inputTokens, detail.outputTokens)}</>,
    <>Out: {formatObservabilityTokenCount(detail.outputTokens)}</>,
    <>Total: {formatObservabilityTokenCount(detail.totalTokens)}</>,
  ];
  if (detail.cachedTokens != null) {
    tokenRows.push(<>Cached: {formatObservabilityTokenCount(detail.cachedTokens)}</>);
  }
  if (detail.cacheCreationTokens != null) {
    tokenRows.push(<>Cache write: {formatObservabilityTokenCount(detail.cacheCreationTokens)}</>);
  }

  return (
    <div className="space-y-3">
      <DetailGrid
        fields={[
          { label: 'module', value: detail.module, mono: false },
          { label: 'feature', value: detail.feature ?? '—', mono: false },
        ]}
      />
      <div className={executionDetailMetricGridClassName}>
        <MetricTile label="Tokens" rows={tokenRows} />
        <MetricTile
          label="Cost"
          rows={[
            <>In: {formatObservabilityUsd(detail.inputCostUsd)}</>,
            <>Out: {formatObservabilityUsd(detail.outputCostUsd)}</>,
            <>Total: {formatObservabilityUsd(detail.totalCostUsd)}</>,
          ]}
        />
        <MetricTile
          label="Timing"
          rows={[
            <>Latency: {formatLatencyMs(detail.latencyMs)}</>,
            <>TTFT: {formatLatencyMs(detail.ttftMs)}</>,
          ]}
        />
      </div>
    </div>
  );
}
