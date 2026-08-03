import type { NutritionParseAiData, ParsedNutritionResult } from '@/types/fitness';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';
import { NutritionMacroChips } from '@/components/molecules/fitness/NutritionMacroChips';

const ITEM_CHIP_CLASS =
  'rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-200';

export interface NutritionParsePreviewCardProps {
  result: ParsedNutritionResult;
  aiEnvelope: NutritionParseAiData | null;
  isLogging?: boolean;
  onConfirm: () => void;
  onEdit: () => void;
  onDismiss: () => void;
  className?: string;
}

/** Compact read-only card showing what the AI parsed before logging. */
export function NutritionParsePreviewCard({
  result,
  aiEnvelope,
  isLogging = false,
  onConfirm,
  onEdit,
  onDismiss,
  className,
}: NutritionParsePreviewCardProps) {
  const title = result.foodNameSummary.trim() || 'Parsed meal';

  return (
    <div
      className={cn(fitnessSectionClassName, fitnessSectionCompactPaddingClassName, className)}
      data-testid="nutrition-parse-preview-card"
    >
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>

      {result.foodItems.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Detected items">
          {result.foodItems.map((item) => (
            <li key={item.name}>
              <span className={ITEM_CHIP_CLASS}>
                {item.name}
                {item.calories > 0 ? (
                  <span className="ml-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {item.calories} kcal
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          No individual items detected.
        </p>
      )}

      <NutritionMacroChips
        className="mt-3"
        calories={result.calories}
        proteinGrams={result.proteinGrams}
        carbGrams={result.carbGrams}
        fatGrams={result.fatGrams}
        fiberGrams={result.fiberGrams}
      />

      {result.assumptions.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-gray-600 dark:text-gray-400">
          {result.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      )}

      {aiEnvelope ? (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Model confidence {Math.round((aiEnvelope.confidence ?? 0) * 100)}%
          {aiEnvelope.cached ? ' · cached' : ''}
          {result.needsUserConfirmation ? ' · confirm macros if unsure' : ''}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLogging}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLogging ? 'Logging…' : 'Confirm & log'}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={isLogging}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={isLogging}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
