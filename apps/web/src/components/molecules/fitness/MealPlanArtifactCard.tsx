import type { RefObject } from 'react';
import type { MealPlanMeal } from '@/types/fitness';
import { cn } from '@/lib/utils';
import {
  fitnessHeroArtifactClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';
import { areAllMealsLogged, isMealLogged } from '@/lib/fitness/meal-plan-artifact';

const PRIMARY_BUTTON_CLASS =
  'rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50';

const STATUS_CHIP_CLASS =
  'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200';

export interface MealPlanArtifactCardProps {
  title: string;
  meals: MealPlanMeal[];
  assumptions: string[];
  confidence: number;
  provider?: string;
  planId: string | null;
  loggedMealIds: Set<string>;
  isSaving?: boolean;
  isLoggingAll?: boolean;
  loggingMealId?: string | null;
  onSave: () => void;
  onLogAll: () => void;
  onDismiss: () => void;
  onLogMeal: (meal: MealPlanMeal) => void;
  className?: string;
  cardRef?: RefObject<HTMLDivElement | null>;
}

export function MealPlanArtifactCard({
  title,
  meals,
  assumptions,
  confidence,
  provider,
  planId,
  loggedMealIds,
  isSaving = false,
  isLoggingAll = false,
  loggingMealId = null,
  onSave,
  onLogAll,
  onDismiss,
  onLogMeal,
  className,
  cardRef,
}: MealPlanArtifactCardProps) {
  const isSaved = Boolean(planId);
  const allLogged = areAllMealsLogged(meals, loggedMealIds);
  const actionsDisabled = isSaving || isLoggingAll;

  return (
    <div
      ref={cardRef}
      className={cn(fitnessHeroArtifactClassName, fitnessSectionCompactPaddingClassName, className)}
      data-testid="meal-plan-artifact-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">
            Confidence {Math.round(confidence * 100)}%{provider ? ` · ${provider}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSaved ? (
            <span className={STATUS_CHIP_CLASS} data-testid="meal-plan-saved-chip">
              Saved
            </span>
          ) : null}
          {allLogged ? (
            <span className={STATUS_CHIP_CLASS} data-testid="meal-plan-logged-chip">
              Logged
            </span>
          ) : null}
        </div>
      </div>

      <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
        {meals.map((meal) => {
          const logged = isMealLogged(meal.id, loggedMealIds);
          const isLoggingThis = loggingMealId === meal.id;

          return (
            <li key={meal.id} className="py-3 text-sm first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {meal.name} <span className="font-normal text-gray-500">· {meal.mealType}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {Math.round(meal.calories)} kcal · P{meal.proteinGrams.toFixed(0)} C
                    {meal.carbGrams.toFixed(0)} F{meal.fatGrams.toFixed(0)}
                  </p>
                  {meal.ingredientsUsed.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Uses: {meal.ingredientsUsed.join(', ')}
                    </p>
                  )}
                  {meal.recipeSteps.length > 0 && (
                    <ol className="mt-2 list-inside list-decimal text-xs text-gray-600 dark:text-gray-400">
                      {meal.recipeSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>
                {logged ? (
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">Logged</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onLogMeal(meal)}
                    disabled={actionsDisabled || isLoggingThis || !planId}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoggingThis ? 'Logging…' : 'Log to nutrition'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {assumptions.length > 0 && (
        <ul className="mt-3 list-inside list-disc text-xs text-gray-600 dark:text-gray-400">
          {assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={actionsDisabled || isSaved}
          className={PRIMARY_BUTTON_CLASS}
        >
          {isSaving ? 'Saving…' : 'Save plan'}
        </button>
        <button
          type="button"
          onClick={onLogAll}
          disabled={actionsDisabled || allLogged || meals.length === 0}
          className={PRIMARY_BUTTON_CLASS}
        >
          {isLoggingAll ? 'Logging all…' : 'Log all to nutrition'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={actionsDisabled}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
