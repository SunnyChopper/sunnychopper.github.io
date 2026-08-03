import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/atoms/Skeleton';
import { Select } from '@/components/atoms/Select';
import BurnBreakdownActions from '@/components/molecules/observability/BurnBreakdownActions';
import {
  burnBreakdownCardClassName,
  burnBreakdownGroupByClassName,
  burnBreakdownGroupByLabelClassName,
  burnBreakdownSelectClassName,
  burnBreakdownSectionTitleClassName,
  burnBreakdownTableMinWidthClassName,
  burnBreakdownTdKeyClassName,
  burnBreakdownTdNumericClassName,
  burnBreakdownTdActionsClassName,
  burnBreakdownThNumericClassName,
  burnBreakdownToolbarClassName,
} from '@/lib/observability/burn-surfaces';
import {
  formatObservabilityTokenCount,
  formatObservabilityUsd,
} from '@/lib/observability-formatters';
import { cn } from '@/lib/utils';
import type { CostGuardrailStatus, ObservabilityBreakdownRow } from '@/types/observability';

export type BurnGroupBy = 'module' | 'model' | 'provider' | 'feature';

export type BurnBreakdownTableProps = {
  groupBy: BurnGroupBy;
  onGroupByChange: (value: BurnGroupBy) => void;
  rows: ObservabilityBreakdownRow[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  guardrails?: CostGuardrailStatus;
};

const SKELETON_ROW_COUNT = 6;

function BreakdownSkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
          <td className="py-2 pr-4">
            <Skeleton className="h-4 w-32" variant="text" />
          </td>
          {Array.from({ length: 5 }, (_, j) => (
            <td key={j} className={burnBreakdownTdNumericClassName}>
              <Skeleton className="ml-auto h-4 w-16" variant="text" />
            </td>
          ))}
          <td className={burnBreakdownTdActionsClassName}>
            <Skeleton className="ml-auto h-7 w-28" variant="rectangular" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function BurnBreakdownTable({
  groupBy,
  onGroupByChange,
  rows,
  isLoading,
  isFetching,
  isError,
  guardrails,
}: BurnBreakdownTableProps) {
  return (
    <div className={cn(burnBreakdownCardClassName, isFetching && !isLoading && 'opacity-70')}>
      <div className={burnBreakdownToolbarClassName}>
        <h3 className={burnBreakdownSectionTitleClassName}>Breakdown</h3>
        <div className={burnBreakdownGroupByClassName}>
          <span className={burnBreakdownGroupByLabelClassName}>Group by</span>
          <Select
            className={burnBreakdownSelectClassName}
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as BurnGroupBy)}
            aria-label="Group breakdown by"
          >
            <option value="module">Module</option>
            <option value="feature">Feature</option>
            <option value="model">Model</option>
            <option value="provider">Provider</option>
          </Select>
          {isFetching && !isLoading ? (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-400"
              aria-label="Loading breakdown"
            />
          ) : null}
        </div>
      </div>
      <table className={burnBreakdownTableMinWidthClassName}>
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-700">
            <th className="py-2 pr-4">{groupBy}</th>
            <th className={burnBreakdownThNumericClassName}>Cost</th>
            <th className={burnBreakdownThNumericClassName}>Input tokens</th>
            <th className={burnBreakdownThNumericClassName}>Output tokens</th>
            <th className={burnBreakdownThNumericClassName}>Total tokens</th>
            <th className={burnBreakdownThNumericClassName}>Calls</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && rows.length === 0 ? <BreakdownSkeletonRows /> : null}
          {isError && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-sm text-red-600">
                Failed to load breakdown.
              </td>
            </tr>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                No breakdown data in this window.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            rows.map((r) => (
              <tr
                key={r.key + r.callCount}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className={burnBreakdownTdKeyClassName}>{r.key || '—'}</td>
                <td className={burnBreakdownTdNumericClassName}>
                  {formatObservabilityUsd(r.totalCostUsd)}
                </td>
                <td className={burnBreakdownTdNumericClassName}>
                  {formatObservabilityTokenCount(r.inputTokens)}
                </td>
                <td className={burnBreakdownTdNumericClassName}>
                  {formatObservabilityTokenCount(r.outputTokens)}
                </td>
                <td className={burnBreakdownTdNumericClassName}>
                  {formatObservabilityTokenCount(r.totalTokens)}
                </td>
                <td className={burnBreakdownTdNumericClassName}>
                  {formatObservabilityTokenCount(r.callCount)}
                </td>
                <td className={burnBreakdownTdActionsClassName}>
                  <BurnBreakdownActions rowKey={r.key} groupBy={groupBy} guardrails={guardrails} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
