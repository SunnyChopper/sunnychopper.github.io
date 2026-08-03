import { Archive } from 'lucide-react';
import type {
  WeeklyReviewAcceptedTask,
  WeeklyReviewCapacityAdvisory,
  WeeklyReviewDeScopeDecision,
  WeeklyReviewTechDebtDecision,
} from '@/types/growth-system';
import {
  capacityAdvisoryReasonLine,
  computeLivePlannedStoryPoints,
  isCapacityOverloaded,
  pickVisibleDeScopeCandidates,
} from '@/lib/growth-system/weekly-review-capacity-descoping';
import { cn } from '@/lib/utils';

interface CapacityDeScopeAdvisoryProps {
  advisory: WeeklyReviewCapacityAdvisory;
  acceptedSuggestions: WeeklyReviewAcceptedTask[];
  deScopeDecisions: WeeklyReviewDeScopeDecision[];
  techDebtDecisions: WeeklyReviewTechDebtDecision[];
  onDeScopeChange: (decisions: WeeklyReviewDeScopeDecision[]) => void;
  readOnly?: boolean;
}

export function CapacityDeScopeAdvisory({
  advisory,
  acceptedSuggestions,
  deScopeDecisions,
  techDebtDecisions,
  onDeScopeChange,
  readOnly = false,
}: CapacityDeScopeAdvisoryProps) {
  const planned = computeLivePlannedStoryPoints({
    advisory,
    acceptedSuggestions,
    deScopeDecisions,
    techDebtDecisions,
  });
  const soft = advisory.softWeeklyCapacityStoryPoints;
  const overloaded = isCapacityOverloaded(planned, soft);

  if (!overloaded && deScopeDecisions.length === 0) {
    return null;
  }

  const visible = pickVisibleDeScopeCandidates(advisory, deScopeDecisions, techDebtDecisions);

  const toggleBacklog = (taskId: string) => {
    if (readOnly) return;
    const existing = deScopeDecisions.find((d) => d.taskId === taskId);
    if (existing) {
      onDeScopeChange(deScopeDecisions.filter((d) => d.taskId !== taskId));
      return;
    }
    onDeScopeChange([...deScopeDecisions, { taskId, action: 'backlog' }]);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Planned {planned} / Soft capacity {soft} pts
        </p>
        <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
          {capacityAdvisoryReasonLine(advisory)}
        </p>
      </div>

      {visible.length > 0 && (
        <ul className="space-y-3">
          {visible.map((candidate) => {
            const selected = deScopeDecisions.some((d) => d.taskId === candidate.taskId);
            return (
              <li
                key={candidate.taskId}
                className="flex flex-col gap-3 rounded-lg border border-amber-200/60 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/20 dark:bg-gray-900/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {candidate.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {candidate.size} pts · Largest non-P1 to close the gap
                  </p>
                </div>
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleBacklog(candidate.taskId)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    selected
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                      : 'border-amber-300/80 bg-amber-100/50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50',
                    readOnly && 'cursor-not-allowed opacity-60'
                  )}
                >
                  <Archive className="h-4 w-4" />
                  {selected ? 'Queued for backlog' : 'Move to backlog'}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {deScopeDecisions.length > 0 && visible.length === 0 && (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          {deScopeDecisions.length} task(s) queued to move to backlog on complete.
        </p>
      )}
    </section>
  );
}
