import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { useOneThing, useSetOneThing, useSuggestOneThing } from '@/hooks/usePlanner';
import {
  plannerFeaturePanelClassName,
  plannerHeadingClassName,
  plannerMutedClassName,
} from '@/lib/planner/planner-surfaces';
import { addDaysISO, todayISOLocal } from '@/lib/planner/week';
import type { OneThingCandidate } from '@/types/planner';

export interface PlannerOneThingPanelProps {
  /** Called after a successful save (e.g. refetch week). */
  onSaved?: () => void;
}

function sortCandidatesByScore(items: OneThingCandidate[]): OneThingCandidate[] {
  return [...items].sort((a, b) => b.plannerScore - a.plannerScore).slice(0, 2);
}

/**
 * Tomorrow's single focus task: load selection, fetch top-2 suggestions if empty, pin on click.
 * Lives on the main Planner page so scheduling and commitment stay in one place.
 */
export function PlannerOneThingPanel({ onSaved }: PlannerOneThingPanelProps) {
  const tomorrow = addDaysISO(todayISOLocal(), 1);
  const { data: existing, isLoading } = useOneThing(tomorrow);
  const suggest = useSuggestOneThing();
  const save = useSetOneThing();
  const [candidates, setCandidates] = useState<OneThingCandidate[]>([]);
  const [pinningTaskId, setPinningTaskId] = useState<string | null>(null);
  const [suggestionsReady, setSuggestionsReady] = useState(false);
  const fetched = useRef(false);

  const loadSuggestions = useCallback(async () => {
    setSuggestionsReady(false);
    try {
      const res = await suggest.mutateAsync(tomorrow);
      setCandidates(sortCandidatesByScore(res.candidates));
      setSuggestionsReady(true);
    } catch {
      fetched.current = false;
      setSuggestionsReady(false);
    }
  }, [suggest, tomorrow]);

  useEffect(() => {
    if (isLoading || fetched.current) return;
    if (existing?.selectedTaskId) return;
    fetched.current = true;
    void loadSuggestions();
  }, [isLoading, tomorrow, existing, loadSuggestions]);

  const handleRetrySuggestions = () => {
    fetched.current = true;
    void loadSuggestions();
  };

  const handlePinSuggestion = (candidate: OneThingCandidate) => {
    setPinningTaskId(candidate.taskId);
    save.mutate(
      {
        targetDate: tomorrow,
        taskId: candidate.taskId,
        selectionReason: 'Planner — suggested pin',
      },
      {
        onSuccess: () => {
          setPinningTaskId(null);
          onSaved?.();
        },
        onError: () => setPinningTaskId(null),
      }
    );
  };

  const lockedTaskId = existing?.selectedTaskId ?? null;
  const lockedCandidate = lockedTaskId
    ? candidates.find((c) => c.taskId === lockedTaskId)
    : undefined;
  const showSuggestions =
    !isLoading && !lockedTaskId && candidates.length > 0 && !suggest.isPending;
  const showEmptySuggestions =
    !isLoading &&
    !lockedTaskId &&
    !suggest.isPending &&
    suggestionsReady &&
    candidates.length === 0 &&
    !suggest.isError;

  return (
    <section
      className={`space-y-3 p-4 ${plannerFeaturePanelClassName}`}
      aria-labelledby="planner-one-thing-heading"
    >
      <div className="flex items-start gap-2">
        <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <h2
            id="planner-one-thing-heading"
            className={`text-base font-semibold ${plannerHeadingClassName}`}
          >
            One thing for tomorrow
          </h2>
          <p className={`text-sm ${plannerMutedClassName}`}>
            Pick a single focus task for <strong>{tomorrow}</strong>. It pins on that day in the
            week below.
          </p>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

      {suggest.isPending && !isLoading && !lockedTaskId && (
        <p className="text-sm text-gray-500">Finding your highest-leverage task…</p>
      )}

      {suggest.isError && !isLoading && !lockedTaskId && candidates.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not load suggestions. Try again or refresh the page.
          </p>
          <Button variant="secondary" size="sm" onClick={handleRetrySuggestions}>
            Retry suggestions
          </Button>
        </div>
      )}

      {showSuggestions && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Suggested focus — tap to pin:
          </p>
          <ul className="space-y-2">
            {candidates.map((candidate) => {
              const isPinning = pinningTaskId === candidate.taskId && save.isPending;
              return (
                <li key={candidate.taskId}>
                  <button
                    type="button"
                    onClick={() => handlePinSuggestion(candidate)}
                    disabled={save.isPending}
                    className="w-full text-left rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 p-3 transition hover:border-indigo-400/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
                      {candidate.title}
                    </div>
                    {candidate.reason ? (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {candidate.reason}
                      </div>
                    ) : null}
                    {isPinning ? (
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        Pinning…
                      </div>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showEmptySuggestions && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No high-priority items to suggest yet. Add or prioritize tasks in your backlog, then check
          back.
        </p>
      )}

      {lockedTaskId && !isLoading && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 space-y-1 dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Locked for tomorrow
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {lockedCandidate?.title ?? lockedTaskId}
          </p>
          {lockedCandidate?.reason && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-gray-200">
                Why this is the bottleneck:
              </span>{' '}
              {lockedCandidate.reason}
            </p>
          )}
          {existing?.selectionReason && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{existing.selectionReason}</p>
          )}
        </div>
      )}
    </section>
  );
}
