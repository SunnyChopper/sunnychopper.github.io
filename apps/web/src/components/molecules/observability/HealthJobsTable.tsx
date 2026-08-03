import { Skeleton } from '@/components/atoms/Skeleton';
import {
  obsTableContainerClassName,
  obsTableHeadClassName,
  obsTableMinWidthClassName,
} from '@/lib/observability/observability-surfaces';
import HealthJobRow from '@/components/molecules/observability/HealthJobRow';
import type { EditorLinkSettings } from '@/lib/editor-links';
import type { ObservabilityHealthRow } from '@/types/observability';

export type HealthJobsTableProps = {
  rows: ObservabilityHealthRow[];
  expandedRowId: string | null;
  onToggleDetails: (rowId: string) => void;
  onInvestigate: (row: ObservabilityHealthRow) => void;
  onReplay: (rowId: string) => void;
  isReplayPending: boolean;
  isLoading: boolean;
  editorLinkSettings: EditorLinkSettings;
};

const SKELETON_ROW_COUNT = 6;

function HealthJobsSkeletonRows() {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
          <td className="px-2 py-2">
            <Skeleton className="h-4 w-32" variant="text" />
          </td>
          <td className="px-2 py-2">
            <Skeleton className="h-4 w-20" variant="text" />
          </td>
          <td className="px-2 py-2">
            <Skeleton className="h-5 w-16 rounded-full" variant="rectangular" />
          </td>
          <td className="px-2 py-2">
            <Skeleton className="h-4 w-28" variant="text" />
          </td>
          <td className="px-2 py-2">
            <div className="flex w-full min-w-[8rem] flex-col gap-1 sm:w-auto">
              <Skeleton className="h-7 w-full sm:w-24" variant="rectangular" />
              <Skeleton className="h-7 w-full sm:w-24" variant="rectangular" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function HealthJobsTable({
  rows,
  expandedRowId,
  onToggleDetails,
  onInvestigate,
  onReplay,
  isReplayPending,
  isLoading,
  editorLinkSettings,
}: HealthJobsTableProps) {
  return (
    <div className={obsTableContainerClassName}>
      <table className={obsTableMinWidthClassName}>
        <thead>
          <tr className={obsTableHeadClassName}>
            <th className="px-2 py-2">Job</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Last failure</th>
            <th className="w-36 px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <HealthJobsSkeletonRows />
          ) : (
            rows.map((row) => (
              <HealthJobRow
                key={row.rowId}
                row={row}
                isExpanded={expandedRowId === row.rowId}
                onToggleDetails={() => onToggleDetails(row.rowId)}
                onInvestigate={() => onInvestigate(row)}
                onReplay={() => onReplay(row.rowId)}
                isReplayPending={isReplayPending}
                editorLinkSettings={editorLinkSettings}
              />
            ))
          )}
        </tbody>
      </table>
      {!isLoading && rows.length === 0 && (
        <p className="p-6 text-center text-gray-500">No system health rows in this window.</p>
      )}
    </div>
  );
}
