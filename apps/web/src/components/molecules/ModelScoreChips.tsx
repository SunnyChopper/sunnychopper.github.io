import { Gauge, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssistantModelCatalogEntry } from '@/types/chatbot';

type ModelScoreChipsProps = {
  qualityScore: number;
  speedScore: number;
  costScore: number;
  contextTokens?: number | null;
  className?: string;
};

function ScoreChip({
  icon: Icon,
  label,
  score,
}: {
  icon: typeof Sparkles;
  label: string;
  score: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-600 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-300">
      <Icon className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      <span>
        {label} {score}/10
      </span>
    </span>
  );
}

export function ModelScoreChips({
  qualityScore,
  speedScore,
  costScore,
  contextTokens,
  className,
}: ModelScoreChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      <ScoreChip icon={Sparkles} label="Quality" score={qualityScore} />
      <ScoreChip icon={Zap} label="Speed" score={speedScore} />
      <ScoreChip icon={Gauge} label="Cost" score={costScore} />
      {contextTokens ? (
        <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-600 dark:border-gray-600 dark:bg-gray-900/50 dark:text-gray-300">
          {(contextTokens / 1000).toFixed(0)}k ctx
        </span>
      ) : null}
    </div>
  );
}

export function ModelScoreChipsFromEntry({
  entry,
  className,
}: {
  entry: Pick<
    AssistantModelCatalogEntry,
    'qualityScore' | 'speedScore' | 'costScore' | 'contextTokens'
  >;
  className?: string;
}) {
  return (
    <ModelScoreChips
      qualityScore={entry.qualityScore}
      speedScore={entry.speedScore}
      costScore={entry.costScore}
      contextTokens={entry.contextTokens}
      className={className}
    />
  );
}
