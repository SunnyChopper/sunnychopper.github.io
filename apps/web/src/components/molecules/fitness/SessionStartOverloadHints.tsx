import type { OverloadSuggestion } from '@/types/fitness';
import {
  fitnessInteractiveRowClassName,
  fitnessSuccessCalloutClassName,
} from '@/lib/fitness/fitness-surfaces';
import { cn } from '@/lib/utils';

export interface SessionStartOverloadHintsProps {
  suggestions: OverloadSuggestion[];
  nameById: Map<string, string> | Record<string, string>;
  selectedExerciseId?: string;
  onSelectExercise: (exerciseId: string) => void;
  className?: string;
}

function resolveName(id: string, nameById: Map<string, string> | Record<string, string>): string {
  if (nameById instanceof Map) {
    return nameById.get(id) ?? id;
  }
  return nameById[id] ?? id;
}

function formatLastSuccess(hint: OverloadSuggestion): string | null {
  if (hint.lastSuccessfulWeight == null) return null;
  const reps =
    hint.lastSuccessfulCompletedReps != null ? ` × ${hint.lastSuccessfulCompletedReps}` : '';
  return `${hint.lastSuccessfulWeight}${reps} ${hint.unit}`;
}

export function SessionStartOverloadHints({
  suggestions,
  nameById,
  selectedExerciseId,
  onSelectExercise,
  className,
}: SessionStartOverloadHintsProps) {
  if (suggestions.length === 0) return null;

  return (
    <section className={cn(fitnessSuccessCalloutClassName, className)} aria-label="Session plan">
      <h3 className="font-medium text-emerald-950 dark:text-emerald-100">Session plan</h3>
      <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/80">
        Last successful working sets and suggested next load. Click a row to log that exercise.
      </p>
      <ul className="mt-3 space-y-2">
        {suggestions.map((hint) => {
          const name = resolveName(hint.exerciseId, nameById);
          const lastSuccess = formatLastSuccess(hint);
          const isSelected = selectedExerciseId === hint.exerciseId;

          return (
            <li key={hint.exerciseId}>
              <button
                type="button"
                onClick={() => onSelectExercise(hint.exerciseId)}
                className={cn(
                  fitnessInteractiveRowClassName,
                  'w-full text-left transition-colors hover:border-emerald-400/70 dark:hover:border-emerald-600/70',
                  isSelected &&
                    'border-emerald-400/80 ring-1 ring-emerald-500/30 dark:border-emerald-600/80'
                )}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {name}
                  </span>
                  <div className="text-sm tabular-nums text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">Next </span>
                    <strong>{hint.nextSuggestedWeight}</strong> {hint.unit}
                    <span className="text-gray-500 dark:text-gray-400">
                      {' '}
                      · {hint.nextSuggestedTargetRepsMin}–{hint.nextSuggestedTargetRepsMax} reps
                    </span>
                  </div>
                </div>
                {lastSuccess ? (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Last success: <span className="tabular-nums">{lastSuccess}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    No successful history yet
                  </p>
                )}
                <p className="mt-1 text-xs text-emerald-800/90 dark:text-emerald-200/80">
                  {hint.recommendationReason}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
