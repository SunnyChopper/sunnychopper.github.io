import { useMemo } from 'react';
import { ModelTraitMicroBars } from '@/components/molecules/assistant/AssistantModelPickerPrimitives';
import { optimizeForShortLabel } from '@/lib/assistant/thread-run-config';
import type { AssistantModelCatalogEntry, AssistantOptimizeFor } from '@/types/chatbot';

type AssistantCurrentDefaultsSummaryProps = {
  mode: 'manual' | 'auto';
  reasoningModelId: string;
  responseModelId: string;
  optimizeFor: AssistantOptimizeFor;
  models: AssistantModelCatalogEntry[];
};

function SummaryModelRow({
  role,
  entry,
}: {
  role: string;
  entry: AssistantModelCatalogEntry | undefined;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0 w-[4.75rem]">
          {role}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1">
          {entry?.label ?? '—'}
        </span>
      </div>
      {entry ? (
        <div className="pl-[4.75rem]">
          <ModelTraitMicroBars
            speedScore={entry.speedScore}
            costScore={entry.costScore}
            qualityScore={entry.qualityScore}
          />
        </div>
      ) : null}
    </div>
  );
}

export function AssistantCurrentDefaultsSummary({
  mode,
  reasoningModelId,
  responseModelId,
  optimizeFor,
  models,
}: AssistantCurrentDefaultsSummaryProps) {
  const reasoning = useMemo(
    () => models.find((m) => m.id === reasoningModelId),
    [models, reasoningModelId]
  );
  const response = useMemo(
    () => models.find((m) => m.id === responseModelId),
    [models, responseModelId]
  );

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Current defaults
      </p>
      {mode === 'auto' ? (
        <p className="text-sm text-gray-800 dark:text-gray-200">
          Auto · {optimizeForShortLabel(optimizeFor)}
        </p>
      ) : (
        <div className="space-y-2.5">
          <SummaryModelRow role="Reasoning" entry={reasoning} />
          <SummaryModelRow role="Response" entry={response} />
        </div>
      )}
    </div>
  );
}
