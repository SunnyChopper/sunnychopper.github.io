import type { KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton } from '@/components/atoms/Skeleton';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  formatObservabilityDateTime,
  formatObservabilityUsd,
} from '@/lib/observability-formatters';
import {
  executionLogRowClassName,
  executionLogStatusBadgeClassName,
  executionLogTableClassName,
  executionLogTableContainerClassName,
  executionLogTableHeadClassName,
} from '@/lib/observability/execution-log-surfaces';
import type { ObservabilityExecutionRow } from '@/types/observability';
import ExecutionPreviewCell from './ExecutionPreviewCell';

export type ExecutionLogTableProps = {
  rows: ObservabilityExecutionRow[];
  isLoading: boolean;
  isError: boolean;
  selectedRowId: string | null;
  onRowSelect: (id: string) => void;
};

const SKELETON_ROW_COUNT = 8;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

function ExecutionLogSkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
          <td className="p-2">
            <Skeleton className="h-4 w-28" variant="text" />
          </td>
          <td className="p-2">
            <Skeleton className="h-4 w-24" variant="text" />
          </td>
          <td className="p-2">
            <Skeleton className="h-4 w-20" variant="text" />
          </td>
          <td className="p-2">
            <Skeleton className="h-4 w-24" variant="text" />
          </td>
          <td className="p-2">
            <Skeleton className="h-5 w-16 rounded-full" variant="rectangular" />
          </td>
          <td className="p-2">
            <Skeleton className="h-4 w-14" variant="text" />
          </td>
          <td className="p-2">
            <Skeleton className="h-4 w-40" variant="text" />
          </td>
        </tr>
      ))}
    </>
  );
}

function handleRowKeyDown(
  event: KeyboardEvent<HTMLTableRowElement>,
  rowId: string,
  onRowSelect: (id: string) => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onRowSelect(rowId);
  }
}

export default function ExecutionLogTable({
  rows,
  isLoading,
  isError,
  selectedRowId,
  onRowSelect,
}: ExecutionLogTableProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionBody = prefersReducedMotion ? 'tbody' : motion.tbody;
  const MotionRow = prefersReducedMotion ? 'tr' : motion.tr;
  const bodyMotionProps = prefersReducedMotion
    ? {}
    : {
        variants: containerVariants,
        initial: 'hidden' as const,
        animate: 'show' as const,
      };
  const rowMotionProps = prefersReducedMotion
    ? {}
    : {
        variants: rowVariants,
      };

  return (
    <div className={executionLogTableContainerClassName}>
      <table className={executionLogTableClassName}>
        <thead className={executionLogTableHeadClassName}>
          <tr>
            <th className="p-2 font-medium">Time</th>
            <th className="p-2 font-medium">Module</th>
            <th className="p-2 font-medium">Feature</th>
            <th className="p-2 font-medium">Model</th>
            <th className="p-2 font-medium">Status</th>
            <th className="p-2 font-medium">Cost</th>
            <th className="p-2 font-medium">Preview</th>
          </tr>
        </thead>
        <MotionBody {...bodyMotionProps}>
          {isLoading ? <ExecutionLogSkeletonRows /> : null}
          {isError ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-red-600 text-sm">
                Failed to load executions.
              </td>
            </tr>
          ) : null}
          {!isLoading &&
            !isError &&
            rows.map((row) => (
              <MotionRow
                key={row.id}
                {...rowMotionProps}
                role="button"
                tabIndex={0}
                aria-selected={selectedRowId === row.id}
                className={executionLogRowClassName(row.status, selectedRowId === row.id)}
                onClick={() => onRowSelect(row.id)}
                onKeyDown={(e) => handleRowKeyDown(e, row.id, onRowSelect)}
              >
                <td className="p-2 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                  {formatObservabilityDateTime(row.occurredAt)}
                </td>
                <td className="p-2 font-mono text-xs text-gray-900 dark:text-gray-100">
                  {row.module}
                </td>
                <td className="p-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {row.feature?.trim() ? row.feature : '—'}
                </td>
                <td className="p-2 font-mono text-xs text-gray-900 dark:text-gray-100">
                  {row.model}
                </td>
                <td className="p-2 text-xs">
                  <StatusBadge
                    status={row.status}
                    size="sm"
                    className={executionLogStatusBadgeClassName(row.status)}
                  />
                </td>
                <td className="p-2 text-xs tabular-nums text-gray-700 dark:text-gray-300">
                  {formatObservabilityUsd(row.totalCostUsd)}
                </td>
                <td className="p-2">
                  <ExecutionPreviewCell preview={row.responsePreview} />
                </td>
              </MotionRow>
            ))}
        </MotionBody>
      </table>
      {!isLoading && !isError && rows.length === 0 ? (
        <p className="p-8 text-center text-gray-500 text-sm">No executions in this filter.</p>
      ) : null}
    </div>
  );
}
