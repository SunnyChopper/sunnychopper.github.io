import Button from '@/components/atoms/Button';
import {
  fitnessSectionClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';
import type { TodaysStripState } from '@/lib/fitness/todays-workout-strip';
import { cn } from '@/lib/utils';

export interface TodaysWorkoutStripProps {
  state: TodaysStripState;
  today: string;
  isStarting?: boolean;
  onStart?: (templateId: string) => void;
  onContinueSession?: (sessionId: string) => void;
}

export function TodaysWorkoutStrip({
  state,
  today,
  isStarting = false,
  onStart,
  onContinueSession,
}: TodaysWorkoutStripProps) {
  return (
    <section
      className={cn(fitnessSectionClassName, fitnessSectionCompactPaddingClassName)}
      aria-labelledby="todays-workout-strip-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2
            id="todays-workout-strip-heading"
            className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Today
          </h2>
          <StripBody state={state} today={today} />
        </div>
        <StripAction
          state={state}
          isStarting={isStarting}
          onStart={onStart}
          onContinueSession={onContinueSession}
        />
      </div>
    </section>
  );
}

function StripBody({ state, today }: { state: TodaysStripState; today: string }) {
  switch (state.mode) {
    case 'loading':
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400" role="status">
          Loading today&apos;s plan…
        </p>
      );
    case 'rest':
      return (
        <p className="text-base font-medium text-gray-900 dark:text-white" role="status">
          {state.label}
        </p>
      );
    case 'ready':
      return (
        <p className="text-base text-gray-900 dark:text-white">
          <span className="font-medium">{state.templateName}</span>
          <span className="text-gray-500 dark:text-gray-400"> · scheduled for {today}</span>
        </p>
      );
    case 'completed':
      return (
        <p className="text-base font-medium text-emerald-700 dark:text-emerald-300" role="status">
          Completed
          {state.templateName ? (
            <span className="font-normal text-gray-600 dark:text-gray-400">
              {' '}
              · {state.templateName}
            </span>
          ) : null}
        </p>
      );
    case 'in_progress':
      return (
        <p className="text-base text-gray-900 dark:text-white">
          Session in progress
          {state.templateName ? (
            <span className="text-gray-500 dark:text-gray-400"> · {state.templateName}</span>
          ) : null}
        </p>
      );
    case 'workout_unresolved':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400" role="status">
          Workout day — assign a template in the schedule below or start a session manually.
        </p>
      );
    case 'no_schedule':
      return (
        <p className="text-sm text-gray-600 dark:text-gray-400" role="status">
          No schedule yet — set up your weekly plan below.
        </p>
      );
    default:
      return null;
  }
}

function StripAction({
  state,
  isStarting,
  onStart,
  onContinueSession,
}: {
  state: TodaysStripState;
  isStarting?: boolean;
  onStart?: (templateId: string) => void;
  onContinueSession?: (sessionId: string) => void;
}) {
  if (state.mode === 'ready' && onStart) {
    return (
      <Button
        type="button"
        size="sm"
        className="w-full shrink-0 sm:w-auto"
        disabled={isStarting}
        onClick={() => onStart(state.templateId)}
      >
        Start session
      </Button>
    );
  }

  if (state.mode === 'in_progress' && onContinueSession) {
    return (
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="w-full shrink-0 sm:w-auto"
        onClick={() => onContinueSession(state.sessionId)}
      >
        Continue session
      </Button>
    );
  }

  return null;
}
