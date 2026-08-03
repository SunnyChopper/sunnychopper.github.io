import { useMemo } from 'react';
import { ProviderBrandBadge } from '@/components/atoms/ProviderBrandBadge';
import { ModelPicker } from '@/components/molecules/ModelPicker';
import { ModelScoreChipsFromEntry } from '@/components/molecules/ModelScoreChips';
import { FactCriteriaListEditor } from '@/components/molecules/settings/FactCriteriaListEditor';
import {
  formatModelDisplayLabel,
  formatProviderDisplay,
} from '@/lib/settings/assistantMemoryIngestionDisplay';
import type { AssistantMemoryIngestionFactCriteria } from '@/types/api-contracts';
import type { AssistantModelCatalogData, AssistantModelCatalogEntry } from '@/types/chatbot';

function formatUsdPerMtok(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(3)}`;
  return `$${n.toFixed(4)}`;
}

function SelectedModelDetailStrip({ entry }: { entry: AssistantModelCatalogEntry }) {
  const priceParts: string[] = [];
  if (entry.inputUsdPerMtok != null) {
    priceParts.push(`Input ${formatUsdPerMtok(entry.inputUsdPerMtok)} / 1M tok`);
  }
  if (entry.outputUsdPerMtok != null) {
    priceParts.push(`Output ${formatUsdPerMtok(entry.outputUsdPerMtok)} / 1M tok`);
  }

  return (
    <div className="border-t border-gray-200/80 bg-gray-50/80 px-3 py-3 sm:px-4 dark:border-gray-700/80 dark:bg-gray-800/40 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ProviderBrandBadge providerId={entry.provider} />
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatModelDisplayLabel(entry.label, entry.provider)}
        </p>
      </div>
      <ModelScoreChipsFromEntry entry={entry} />
      {priceParts.length > 0 ? (
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <span className="font-medium text-gray-700 dark:text-gray-200">List price</span>
          {' · '}
          {priceParts.join(' · ')}
        </p>
      ) : null}
      {entry.publishedTps != null && entry.publishedTps > 0 ? (
        <p className="text-xs text-gray-600 dark:text-gray-300">
          Published throughput ~{entry.publishedTps.toLocaleString()} tokens/s
        </p>
      ) : null}
      {entry.pricingNote ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.pricingNote}</p>
      ) : null}
    </div>
  );
}

export type AssistantMemoryIngestionFormProps = {
  catalog: AssistantModelCatalogData | null;
  provider: string;
  model: string;
  factCriteria: AssistantMemoryIngestionFactCriteria;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  onFactCriteriaChange: (criteria: AssistantMemoryIngestionFactCriteria) => void;
  disabled?: boolean;
};

export function AssistantMemoryIngestionForm({
  catalog,
  provider,
  model,
  factCriteria,
  onProviderChange,
  onModelChange,
  onFactCriteriaChange,
  disabled,
}: AssistantMemoryIngestionFormProps) {
  const catalogModels = useMemo(() => {
    if (!catalog?.models.length) return [];
    return catalog.models.slice().sort((a, b) => {
      const byProvider = formatProviderDisplay(a.provider).localeCompare(
        formatProviderDisplay(b.provider)
      );
      if (byProvider !== 0) return byProvider;
      return (
        b.qualityScore - a.qualityScore ||
        formatModelDisplayLabel(a.label, a.provider).localeCompare(
          formatModelDisplayLabel(b.label, b.provider)
        )
      );
    });
  }, [catalog]);

  const selectedEntry = useMemo((): AssistantModelCatalogEntry | null => {
    if (!catalog?.models.length) return null;
    return (
      catalog.models.find((m) => m.provider === provider && m.apiModelId === model) ??
      catalog.models.find((m) => m.apiModelId === model) ??
      null
    );
  }, [catalog, provider, model]);

  const showCatalogPicker = catalogModels.length > 0 && (selectedEntry != null || !model.trim());

  const selectClass =
    'mt-1 w-full rounded-lg border border-gray-300/80 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-600/80 dark:bg-gray-800 dark:text-gray-100 dark:focus-visible:ring-offset-gray-800';

  const handleCatalogModelChange = (apiModelId: string) => {
    const entry =
      catalogModels.find((m) => m.apiModelId === apiModelId && m.provider === provider) ??
      catalogModels.find((m) => m.apiModelId === apiModelId);
    if (entry) {
      onProviderChange(entry.provider);
      onModelChange(entry.apiModelId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-200/80 dark:border-gray-700/80">
        <div className="p-3 sm:p-4">
          <label
            htmlFor="mem-ingest-model"
            className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Model
          </label>
          {showCatalogPicker ? (
            <div className="mt-1" id="mem-ingest-model">
              <ModelPicker
                models={catalogModels}
                valueApiModelId={selectedEntry?.apiModelId ?? model}
                onChange={handleCatalogModelChange}
                disabled={disabled || !catalog}
                showProviderBadge
                variant="embedded"
                emptyMessage="No models available — configure at least one LLM provider on the backend."
              />
            </div>
          ) : (
            <input
              id="mem-ingest-model"
              type="text"
              className={selectClass}
              value={model}
              disabled={disabled}
              onChange={(e) => onModelChange(e.target.value)}
              placeholder="e.g. llama-3.1-8b-instant"
              autoComplete="off"
            />
          )}
        </div>
        {selectedEntry ? (
          <SelectedModelDetailStrip entry={selectedEntry} />
        ) : model.trim() ? (
          <p className="border-t border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400 sm:px-4">
            No catalog entry for this model id — speed, cost, and intelligence scores are only shown
            when the id matches the assistant model catalog.
          </p>
        ) : null}
      </div>

      <div className="space-y-6 rounded-lg border border-gray-200/80 p-4 dark:border-gray-700/80">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Standout fact filters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Extra prompt rules for standout-fact extraction (not long-term memory).
          </p>
        </div>
        <FactCriteriaListEditor
          idPrefix="mem-ingest-always"
          title="Always capture (examples)"
          hint="e.g. capital changes, technical code adjustments, target dates"
          emptyMessage="No rules yet."
          items={factCriteria.alwaysCapture}
          disabled={disabled}
          onChange={(alwaysCapture) => onFactCriteriaChange({ ...factCriteria, alwaysCapture })}
        />
        <FactCriteriaListEditor
          idPrefix="mem-ingest-never"
          title="Never capture"
          emptyMessage="No exclusions yet."
          items={factCriteria.neverCapture}
          disabled={disabled}
          onChange={(neverCapture) => onFactCriteriaChange({ ...factCriteria, neverCapture })}
        />
      </div>
    </div>
  );
}
