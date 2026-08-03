import { motion, type Variants } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/routes';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import type { ProactiveAutomationRun } from '@/types/api-contracts';
import {
  isFailedAutomationRun,
  isSucceededAutomationRun,
  runHistoryErrorPanelClassName,
  runHistoryErrorPanelScrollClassName,
  runHistoryFailedRowClassName,
  runHistorySecondaryLinkClassName,
  runHistorySucceededRowSurfaceClassName,
  runHistorySuccessPreviewClassName,
} from '@/lib/proactive/automation-run-history';
import { cn } from '@/lib/utils';

const RUN_SOURCE_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  manual_batch: 'Manual (all enabled)',
  single_automation_test: 'Test run',
};

export type AutomationRunHistoryItemProps = {
  run: ProactiveAutomationRun;
  errorExpanded: boolean;
  onToggleError: () => void;
  reduceMotion: boolean;
  itemVariants?: Variants;
};

function RunHistoryItemContent({
  run,
  errorExpanded,
  onToggleError,
  reduceMotion,
}: Omit<AutomationRunHistoryItemProps, 'itemVariants'>) {
  const failed = isFailedAutomationRun(run.status);
  const succeeded = isSucceededAutomationRun(run.status);
  const hasError = Boolean(run.errorMessage?.trim());

  const errorPanel =
    failed && hasError ? (
      <div className="mt-2">
        <button
          type="button"
          onClick={onToggleError}
          aria-expanded={errorExpanded}
          className="inline-flex w-full items-center justify-between gap-2 rounded-md px-1 py-1 text-left text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 dark:text-rose-200 dark:hover:bg-rose-950/40"
        >
          <span>{errorExpanded ? 'Hide error details' : 'Show error details'}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              errorExpanded && 'rotate-180',
              reduceMotion && 'transition-none'
            )}
            aria-hidden
          />
        </button>

        {reduceMotion ? (
          errorExpanded ? (
            <div className={cn(runHistoryErrorPanelClassName, 'mt-2 p-2')}>
              <div className={runHistoryErrorPanelScrollClassName}>{run.errorMessage}</div>
            </div>
          ) : null
        ) : (
          <motion.div
            initial={false}
            animate={errorExpanded ? 'visible' : 'hidden'}
            variants={{
              visible: {
                height: 'auto',
                opacity: 1,
                transition: { duration: 0.2, ease: 'easeOut' },
              },
              hidden: {
                height: 0,
                opacity: 0,
                transition: { duration: 0.2, ease: 'easeOut' },
              },
            }}
            className="overflow-hidden"
          >
            <div className={cn(runHistoryErrorPanelClassName, 'mt-2 p-2')}>
              <div className={runHistoryErrorPanelScrollClassName}>{run.errorMessage}</div>
            </div>
          </motion.div>
        )}
      </div>
    ) : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium tabular-nums text-gray-900 dark:text-white">
          {new Date(run.ranAt).toLocaleString()}
        </span>
        <StatusBadge status={succeeded ? 'Succeeded' : 'Failed'} size="sm" />
      </div>

      <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
        Source: {RUN_SOURCE_LABELS[run.runSource] ?? run.runSource}
      </p>

      {succeeded && run.responsePreview?.trim() ? (
        <p className={runHistorySuccessPreviewClassName}>{run.responsePreview.trim()}</p>
      ) : null}

      {errorPanel}

      {run.threadId ? (
        <a
          href={`${ROUTES.admin.assistant}/${encodeURIComponent(run.threadId)}`}
          className={cn(runHistorySecondaryLinkClassName, 'mt-2')}
          target="_blank"
          rel="noreferrer"
        >
          Open thread <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      ) : null}
    </>
  );
}

export default function AutomationRunHistoryItem({
  run,
  errorExpanded,
  onToggleError,
  reduceMotion,
  itemVariants,
}: AutomationRunHistoryItemProps) {
  const failed = isFailedAutomationRun(run.status);
  const rowClassName = cn(
    'p-3 text-sm',
    failed ? runHistoryFailedRowClassName : runHistorySucceededRowSurfaceClassName
  );

  const content = (
    <RunHistoryItemContent
      run={run}
      errorExpanded={errorExpanded}
      onToggleError={onToggleError}
      reduceMotion={reduceMotion}
    />
  );

  if (itemVariants) {
    return (
      <motion.li variants={itemVariants} className={rowClassName}>
        {content}
      </motion.li>
    );
  }

  return <li className={rowClassName}>{content}</li>;
}
