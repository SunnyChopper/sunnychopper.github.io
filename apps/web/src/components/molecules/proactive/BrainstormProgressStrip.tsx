import LinearProgressBar from '@/components/atoms/LinearProgressBar';
import type { BrainstormProgressState } from '@/lib/proactive/brainstorm-progress';
import { cn } from '@/lib/utils';

export type BrainstormProgressStripProps = {
  progress: BrainstormProgressState;
  reduceMotion?: boolean;
  className?: string;
};

export default function BrainstormProgressStrip({
  progress,
  reduceMotion = false,
  className,
}: BrainstormProgressStripProps) {
  if (!progress.isActive) return null;

  return (
    <div
      className={cn(
        'min-w-0 rounded-lg border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40',
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{progress.phaseLabel}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Usually 30–60 seconds</p>
      </div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{progress.statusText}</p>
      <LinearProgressBar
        value={progress.progressValue}
        max={100}
        label="Generating suggestions"
        className="mt-3"
        disableTransition={reduceMotion}
      />
    </div>
  );
}
