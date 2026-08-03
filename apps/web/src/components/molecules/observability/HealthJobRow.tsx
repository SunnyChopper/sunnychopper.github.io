import { Fragment } from 'react';
import { Play, Search } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import HealthErrorPanel from '@/components/molecules/observability/HealthErrorPanel';
import {
  formatHealthFailureAt,
  healthFailedRowAccentClassName,
  healthFailureTimeFailedClassName,
  healthFailureTimeMutedClassName,
  healthRowFailureAt,
  isFailedHealthStatus,
} from '@/lib/observability/health-row';
import { obsStatusBadgeClassName } from '@/lib/observability/observability-surfaces';
import type { EditorLinkSettings } from '@/lib/editor-links';
import { cn } from '@/lib/utils';
import type { ObservabilityHealthRow } from '@/types/observability';

export type HealthJobRowProps = {
  row: ObservabilityHealthRow;
  isExpanded: boolean;
  onToggleDetails: () => void;
  onInvestigate: () => void;
  onReplay: () => void;
  isReplayPending: boolean;
  editorLinkSettings: EditorLinkSettings;
};

export default function HealthJobRow({
  row,
  isExpanded,
  onToggleDetails,
  onInvestigate,
  onReplay,
  isReplayPending,
  editorLinkSettings,
}: HealthJobRowProps) {
  const failed = isFailedHealthStatus(row.lastStatus);
  const failureAt = formatHealthFailureAt(healthRowFailureAt(row));

  return (
    <Fragment>
      <tr
        className={cn(
          'border-b border-gray-100 dark:border-gray-800',
          failed && healthFailedRowAccentClassName
        )}
      >
        <td className="px-2 py-2 font-mono text-xs">{row.jobName}</td>
        <td className="px-2 py-2 text-xs text-gray-600 dark:text-gray-400">{row.jobType}</td>
        <td className="px-2 py-2">
          <StatusBadge
            status={row.lastStatus}
            size="sm"
            className={obsStatusBadgeClassName(row.lastStatus)}
          />
        </td>
        <td className="px-2 py-2">
          <time
            dateTime={healthRowFailureAt(row)}
            className={failed ? healthFailureTimeFailedClassName : healthFailureTimeMutedClassName}
          >
            {failureAt}
          </time>
        </td>
        <td className="px-2 py-2">
          <div className="flex min-w-[8rem] w-full flex-col gap-1 whitespace-nowrap sm:w-auto">
            {failed && (
              <Button
                type="button"
                size="sm"
                variant="primary"
                className="w-full gap-1 sm:w-auto"
                disabled={isReplayPending}
                onClick={onReplay}
              >
                <Play className="h-3 w-3" aria-hidden />
                Replay
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full gap-1 sm:w-auto"
              onClick={onInvestigate}
            >
              <Search className="h-3 w-3" aria-hidden />
              Investigate
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={onToggleDetails}
            >
              {isExpanded ? 'Hide' : 'Details'}
            </Button>
            {!failed && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="w-full gap-1 sm:w-auto"
                disabled={isReplayPending}
                onClick={onReplay}
              >
                <Play className="h-3 w-3" aria-hidden />
                Replay
              </Button>
            )}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50/90 dark:bg-gray-900/40">
          <td colSpan={5} className="px-2 py-2">
            <HealthErrorPanel
              errorMessage={row.errorMessage}
              stackTrace={row.stackTrace}
              settings={editorLinkSettings}
            />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
