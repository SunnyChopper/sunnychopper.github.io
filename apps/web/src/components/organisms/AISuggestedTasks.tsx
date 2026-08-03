import { useCallback, useId, useMemo, useState } from 'react';
import { CircleHelp, ChevronDown, ChevronUp, Plus, Sparkles } from 'lucide-react';
import Button from '@/components/atoms/Button';
import {
  buildWhyThisText,
  primaryGoalId,
  stripSharedGoalRationale,
  unanimousGoalId,
  type GoalGroundingLookup,
} from '@/lib/growth-system/ai-suggested-tasks-grounding';
import { cn } from '@/lib/utils';
import type {
  WeeklyReviewAcceptedTask,
  WeeklyReviewSuggestedTask,
  WeeklyReviewVelocityWeek,
} from '@/types/growth-system';

interface AISuggestedTasksProps {
  suggestions: WeeklyReviewSuggestedTask[];
  accepted: WeeklyReviewAcceptedTask[];
  onAdd: (task: WeeklyReviewAcceptedTask) => void;
  onDismiss: (index: number) => void;
  onRefresh: () => void;
  loading?: boolean;
  /** When true, hide refresh and add actions (archived / completed week). */
  readOnly?: boolean;
  goalById?: Record<string, GoalGroundingLookup>;
  velocityTrend?: string;
  velocityData?: WeeklyReviewVelocityWeek[];
}

const suggestionCardClass =
  'flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between';

function WhyThisPopover({ text, disabled }: { text: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-label="Why this?"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <CircleHelp className="size-3.5" aria-hidden />
        Why this?
      </button>
      {open ? (
        <div
          id={popoverId}
          role="tooltip"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white p-2.5 text-left shadow-lg dark:border-slate-600 dark:bg-slate-900"
        >
          <p className="text-xs leading-snug text-gray-700 dark:text-slate-200">{text}</p>
        </div>
      ) : null}
    </span>
  );
}

function SuggestionCard({
  task,
  suggestionIndex,
  isAccepted,
  readOnly,
  displayRationale,
  whyThisText,
  onAdd,
  onDismiss,
}: {
  task: WeeklyReviewSuggestedTask;
  suggestionIndex: number;
  isAccepted: boolean;
  readOnly: boolean;
  displayRationale: string | null;
  whyThisText: string;
  onAdd: (task: WeeklyReviewAcceptedTask) => void;
  onDismiss: (index: number) => void;
}) {
  return (
    <div className={suggestionCardClass}>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-slate-100">{task.title}</p>
          <WhyThisPopover text={whyThisText} disabled={readOnly} />
        </div>
        {displayRationale ? (
          <p className="text-sm text-gray-600 dark:text-slate-400">{displayRationale}</p>
        ) : null}
        {task.suggestedStoryPoints != null && (
          <p className="text-xs text-gray-500 dark:text-slate-500">
            ~{task.suggestedStoryPoints} pts
          </p>
        )}
      </div>
      {readOnly ? (
        isAccepted ? (
          <span className="shrink-0 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            Added to sprint
          </span>
        ) : null
      ) : (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            disabled={isAccepted}
            onClick={() =>
              onAdd({
                title: task.title,
                description: task.rationale,
                area: task.area || 'Operations',
                priority: 'P3',
                size: task.suggestedStoryPoints ?? undefined,
                goalIds: task.goalIds ?? [],
                projectIds: task.projectIds ?? [],
              })
            }
          >
            <Plus className="h-4 w-4" />
            {isAccepted ? 'Added' : 'Add to this week'}
          </Button>
          {!isAccepted ? (
            <Button variant="secondary" size="sm" onClick={() => onDismiss(suggestionIndex)}>
              Dismiss
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function AISuggestedTasks({
  suggestions,
  accepted,
  onAdd,
  onDismiss,
  onRefresh,
  loading,
  readOnly = false,
  goalById = {},
  velocityTrend,
  velocityData,
}: AISuggestedTasksProps) {
  const [expanded, setExpanded] = useState(false);

  const isAccepted = useCallback(
    (t: WeeklyReviewSuggestedTask) => accepted.some((a) => a.title === t.title),
    [accepted]
  );

  const sharedGoalId = useMemo(() => unanimousGoalId(suggestions), [suggestions]);
  const sharedGoalTitle = sharedGoalId ? (goalById[sharedGoalId]?.title ?? null) : null;
  const shouldCollapse = Boolean(sharedGoalId && suggestions.length > 2);

  const visibleWithIndex = useMemo(() => {
    const visible = shouldCollapse && !expanded ? suggestions.slice(0, 2) : suggestions;
    return visible.map((task) => ({
      task,
      suggestionIndex: suggestions.indexOf(task),
    }));
  }, [expanded, shouldCollapse, suggestions]);

  const hiddenCount = shouldCollapse && !expanded ? suggestions.length - 2 : 0;

  const resolveWhyThisText = useCallback(
    (task: WeeklyReviewSuggestedTask) => {
      const goalId = primaryGoalId(task);
      const goal = goalId ? goalById[goalId] : undefined;
      return buildWhyThisText({
        goalTitle: goal?.title ?? sharedGoalTitle,
        criteria: goal?.successCriteria,
        velocityTrend,
        velocityData,
        rationale: task.rationale,
        unanimousGoalTitle: sharedGoalTitle,
      });
    },
    [goalById, sharedGoalTitle, velocityData, velocityTrend]
  );

  const resolveDisplayRationale = useCallback(
    (task: WeeklyReviewSuggestedTask) => {
      if (!sharedGoalTitle) return task.rationale?.trim() || null;
      const stripped = stripSharedGoalRationale(task.rationale, sharedGoalTitle);
      return stripped || null;
    },
    [sharedGoalTitle]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-200">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            AI task ideas
          </h3>
          {sharedGoalTitle ? (
            <p className="text-sm text-gray-600 dark:text-slate-400">
              All suggestions for{' '}
              <span className="font-medium text-gray-900 dark:text-slate-200">
                {sharedGoalTitle}
              </span>
            </p>
          ) : null}
        </div>
        {!readOnly && (
          <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
            {loading ? 'Thinking…' : 'Refresh suggestions'}
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {visibleWithIndex.map(({ task, suggestionIndex }) => (
          <SuggestionCard
            key={`${task.title}-${suggestionIndex}`}
            task={task}
            suggestionIndex={suggestionIndex}
            isAccepted={isAccepted(task)}
            readOnly={readOnly}
            displayRationale={resolveDisplayRationale(task)}
            whyThisText={resolveWhyThisText(task)}
            onAdd={onAdd}
            onDismiss={onDismiss}
          />
        ))}
      </div>
      {shouldCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={cn(
            'inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700',
            'dark:text-blue-400 dark:hover:text-blue-300'
          )}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden />
              Show {hiddenCount} more
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
