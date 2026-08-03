import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import Dialog from '@/components/molecules/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import AutomationRunHistoryItem from '@/components/molecules/proactive/AutomationRunHistoryItem';
import { proactiveService } from '@/services/proactive.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import { findMostRecentFailedRunId } from '@/lib/proactive/automation-run-history';
import type { ProactiveAutomation } from '@/types/api-contracts';
import { History } from 'lucide-react';

const runListContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const runListItemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export interface AutomationRunHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  automation: ProactiveAutomation | null;
  kindLabel: string;
}

export default function AutomationRunHistoryDialog({
  isOpen,
  onClose,
  automation,
  kindLabel,
}: AutomationRunHistoryDialogProps) {
  const aid = automation?.id;
  const shouldReduceMotion = useReducedMotion();
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const runsQ = useQuery({
    queryKey: queryKeys.proactive.automationRuns(aid ?? ''),
    queryFn: async () => {
      if (!aid) throw new Error('No automation');
      const res = await proactiveService.getAutomationRuns(aid);
      if (!res.success || !res.data) throw new Error(res.error?.message ?? 'Failed to load runs');
      return res.data.runs;
    },
    enabled: isOpen && !!aid,
  });

  const runs = runsQ.data ?? [];

  useEffect(() => {
    if (!isOpen) {
      setExpandedRunId(null);
      return;
    }
    if (runsQ.isSuccess && runsQ.data && runsQ.data.length > 0) {
      setExpandedRunId(findMostRecentFailedRunId(runsQ.data));
    }
  }, [isOpen, aid, runsQ.isSuccess, runsQ.data]);

  const toggleError = (runId: string) => {
    setExpandedRunId((current) => (current === runId ? null : runId));
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Run history" size="lg">
      {automation && kindLabel ? (
        <p className="-mt-2 mb-4 text-sm text-gray-500 dark:text-gray-400">{kindLabel}</p>
      ) : null}

      {runsQ.isPending ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : runsQ.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {(runsQ.error as Error).message}
        </p>
      ) : runs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No runs yet"
          description="Run history appears here after the first scheduled or test execution."
        />
      ) : shouldReduceMotion ? (
        <ul className="max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto pr-1">
          {runs.map((run) => (
            <AutomationRunHistoryItem
              key={run.id}
              run={run}
              errorExpanded={expandedRunId === run.id}
              onToggleError={() => toggleError(run.id)}
              reduceMotion
            />
          ))}
        </ul>
      ) : (
        <motion.ul
          className="max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto pr-1"
          variants={runListContainerVariants}
          initial="hidden"
          animate="show"
        >
          {runs.map((run) => (
            <AutomationRunHistoryItem
              key={run.id}
              run={run}
              errorExpanded={expandedRunId === run.id}
              onToggleError={() => toggleError(run.id)}
              reduceMotion={false}
              itemVariants={runListItemVariants}
            />
          ))}
        </motion.ul>
      )}
    </Dialog>
  );
}
