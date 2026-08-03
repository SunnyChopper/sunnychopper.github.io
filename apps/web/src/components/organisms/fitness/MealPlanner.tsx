import { useCallback, useEffect, useRef, useState } from 'react';
import type { MealPlan, MealPlanMeal, NutritionEntry } from '@/types/fitness';
import { FormInput } from '@/components/atoms/FormInput';
import { FormField } from '@/components/molecules/FormField';
import { MealPlanArtifactCard } from '@/components/molecules/fitness/MealPlanArtifactCard';
import {
  useCreateMealPlanMutation,
  useCreateNutritionMutation,
  useDeleteMealPlanMutation,
  useFitnessMealPlansList,
  useFitnessPantryList,
  useGenerateMealsMutation,
} from '@/hooks/useFitness';
import {
  aiMealToPlanMeal,
  buildNutritionCreateBody,
  resolveLoggedMealIds,
  type ActiveMealPlanArtifact,
} from '@/lib/fitness/meal-plan-artifact';
import { focusFirstIncompleteControl } from '@/lib/forms/focusFirstIncompleteControl';
import { cn } from '@/lib/utils';
import {
  fitnessSectionClassName,
  fitnessSectionCompactPaddingClassName,
} from '@/lib/fitness/fitness-surfaces';

const EMPTY_PANTRY_HINT = 'Add pantry ingredients above before generating meals.';
const EMPTY_PANTRY_HELPER_ID = 'meal-planner-empty-pantry-hint';

interface MealPlannerProps {
  className?: string;
  recentEntries?: NutritionEntry[];
}

export function MealPlanner({ className, recentEntries = [] }: MealPlannerProps) {
  const [mealsCount, setMealsCount] = useState(3);
  const [preferences, setPreferences] = useState('');
  const [activeArtifact, setActiveArtifact] = useState<ActiveMealPlanArtifact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingAll, setIsLoggingAll] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  const mealsCountRef = useRef<HTMLInputElement>(null);
  const preferencesRef = useRef<HTMLInputElement>(null);
  const artifactRef = useRef<HTMLDivElement>(null);
  const shouldScrollToArtifactRef = useRef(false);

  const isMealsCountInvalid = (count: number) => !Number.isFinite(count) || count < 1 || count > 10;

  useEffect(() => {
    focusFirstIncompleteControl([
      {
        id: 'mealsCount',
        isComplete: () => !isMealsCountInvalid(mealsCount),
        focus: () => mealsCountRef.current?.focus(),
      },
      {
        id: 'preferences',
        isComplete: () => preferences.trim() !== '',
        focus: () => preferencesRef.current?.focus(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount focus only
  }, []);

  useEffect(() => {
    if (!shouldScrollToArtifactRef.current || !activeArtifact) return;
    shouldScrollToArtifactRef.current = false;
    const node = artifactRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeArtifact]);

  const { data: pantryData, isLoading: pantryLoading } = useFitnessPantryList(1, 100);
  const { data: plansData, isLoading: plansLoading } = useFitnessMealPlansList(1, 20);
  const generateMut = useGenerateMealsMutation();
  const savePlanMut = useCreateMealPlanMutation();
  const deletePlanMut = useDeleteMealPlanMutation();
  const logNutritionMut = useCreateNutritionMutation();

  const pantryItems = pantryData?.success ? (pantryData.data?.data ?? []) : [];
  const pantryNames = pantryItems.map((p) => p.name);
  const usableCount = pantryItems.length;
  const pantryReady = !pantryLoading && usableCount > 0;
  const pantryEmpty = !pantryLoading && usableCount === 0;
  const generateDisabled = generateMut.isPending || !pantryReady;
  const savedPlans: MealPlan[] = plansData?.success ? (plansData.data?.data ?? []) : [];

  const visibleSavedPlans = savedPlans.filter((plan) => plan.id !== activeArtifact?.planId);

  const getLoggedMealIds = useCallback(
    (planId: string | null, sessionLoggedIds: string[]) =>
      resolveLoggedMealIds(planId, sessionLoggedIds, recentEntries),
    [recentEntries]
  );

  const handleGenerate = async () => {
    setLogError(null);
    const res = await generateMut.mutateAsync({
      mealsCount,
      preferences: preferences.trim() || undefined,
      useCache: true,
    });
    if (res.success && res.data) {
      const { result, confidence, provider, model } = res.data;
      shouldScrollToArtifactRef.current = true;
      setActiveArtifact({
        planId: null,
        title: result.title || 'Meal suggestions',
        meals: result.meals.map(aiMealToPlanMeal),
        assumptions: result.assumptions,
        confidence,
        provider,
        model,
        pantrySnapshot: pantryNames,
        loggedMealIds: [],
      });
    }
  };

  const persistArtifact = async (artifact: ActiveMealPlanArtifact): Promise<string | null> => {
    if (artifact.planId) return artifact.planId;
    if (artifact.meals.length === 0) return null;

    const res = await savePlanMut.mutateAsync({
      title: artifact.title,
      pantrySnapshot: artifact.pantrySnapshot,
      meals: artifact.meals,
      provider: artifact.provider,
      model: artifact.model,
    });

    if (res.success && res.data) {
      return res.data.id;
    }

    return null;
  };

  const handleSavePlan = async () => {
    if (!activeArtifact) return;
    setLogError(null);
    setIsSaving(true);
    try {
      const planId = await persistArtifact(activeArtifact);
      if (planId) {
        setActiveArtifact((prev) => (prev ? { ...prev, planId } : prev));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const logMealsForPlan = async (
    planId: string,
    artifact: ActiveMealPlanArtifact,
    mealIdsToLog: string[]
  ): Promise<string[]> => {
    const mealsToLog = artifact.meals.filter((meal) => mealIdsToLog.includes(meal.id));
    const newlyLogged: string[] = [];

    for (const meal of mealsToLog) {
      const body = buildNutritionCreateBody(artifact, meal, planId);
      const res = await logNutritionMut.mutateAsync(body);
      if (!res.success || !res.data) {
        throw new Error(`Could not log ${meal.name}`);
      }
      newlyLogged.push(meal.id);
    }

    return newlyLogged;
  };

  const handleLogMeal = async (meal: MealPlanMeal) => {
    if (!activeArtifact) return;
    setLogError(null);
    setLoggingMealId(meal.id);
    try {
      const planId = await persistArtifact(activeArtifact);
      if (!planId) {
        setLogError('Save the plan before logging meals.');
        return;
      }

      const newlyLogged = await logMealsForPlan(planId, { ...activeArtifact, planId }, [meal.id]);
      setActiveArtifact((prev) =>
        prev
          ? {
              ...prev,
              planId,
              loggedMealIds: [...new Set([...prev.loggedMealIds, ...newlyLogged])],
            }
          : prev
      );
    } catch {
      setLogError('Could not log meal. Try again.');
    } finally {
      setLoggingMealId(null);
    }
  };

  const handleLogAll = async () => {
    if (!activeArtifact) return;
    setLogError(null);
    setIsLoggingAll(true);
    try {
      const planId = await persistArtifact(activeArtifact);
      if (!planId) {
        setLogError('Could not save plan before logging.');
        return;
      }

      const loggedIds = getLoggedMealIds(planId, activeArtifact.loggedMealIds);
      const remaining = activeArtifact.meals
        .filter((meal) => !loggedIds.has(meal.id))
        .map((m) => m.id);

      const newlyLogged = await logMealsForPlan(planId, { ...activeArtifact, planId }, remaining);

      setActiveArtifact((prev) =>
        prev
          ? {
              ...prev,
              planId,
              loggedMealIds: [...new Set([...prev.loggedMealIds, ...newlyLogged])],
            }
          : prev
      );
    } catch {
      setLogError('Could not log all meals. Some meals may have been logged.');
    } finally {
      setIsLoggingAll(false);
    }
  };

  const handleLogSavedPlanMeal = async (plan: MealPlan, meal: MealPlanMeal) => {
    setLogError(null);
    setLoggingMealId(meal.id);
    try {
      const body = buildNutritionCreateBody(plan, meal, plan.id);
      await logNutritionMut.mutateAsync(body);
    } catch {
      setLogError('Could not log meal. Try again.');
    } finally {
      setLoggingMealId(null);
    }
  };

  const handleDismiss = () => {
    setActiveArtifact(null);
    setLogError(null);
  };

  const activeLoggedMealIds = activeArtifact
    ? getLoggedMealIds(activeArtifact.planId, activeArtifact.loggedMealIds)
    : new Set<string>();

  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meal planner</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Generate from your pantry, then save or log the plan — Recent updates as you go.
        </p>
      </div>

      <div className={cn('flex flex-wrap items-end gap-3', activeArtifact && 'opacity-90')}>
        <FormField label="Meals" htmlFor="meal-planner-count" className="shrink-0">
          <FormInput
            ref={mealsCountRef}
            id="meal-planner-count"
            type="number"
            min={1}
            max={10}
            className="w-16"
            value={mealsCount}
            onChange={(e) => setMealsCount(Number(e.target.value))}
          />
        </FormField>
        <FormField
          label="Preferences (optional)"
          htmlFor="meal-planner-preferences"
          className="min-w-[200px] flex-1"
        >
          <FormInput
            ref={preferencesRef}
            id="meal-planner-preferences"
            className="w-full"
            placeholder="high protein, quick, etc."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </FormField>
        <span className="inline-flex" title={pantryEmpty ? EMPTY_PANTRY_HINT : undefined}>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={generateDisabled}
            aria-describedby={pantryEmpty ? EMPTY_PANTRY_HELPER_ID : undefined}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed',
              pantryReady
                ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                : 'border border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
            )}
          >
            {generateMut.isPending
              ? 'Generating…'
              : pantryReady
                ? `Generate from pantry (${usableCount})`
                : 'Generate from pantry'}
          </button>
        </span>
      </div>

      {activeArtifact && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Generating again replaces the current plan.
        </p>
      )}

      {pantryEmpty && (
        <p id={EMPTY_PANTRY_HELPER_ID} className="text-sm text-amber-700 dark:text-amber-400">
          {EMPTY_PANTRY_HINT}
        </p>
      )}

      {generateMut.isError && (
        <p className="text-sm text-red-600">Could not generate meals. Try again.</p>
      )}

      {logError && <p className="text-sm text-red-600">{logError}</p>}

      {activeArtifact && (
        <MealPlanArtifactCard
          cardRef={artifactRef}
          title={activeArtifact.title}
          meals={activeArtifact.meals}
          assumptions={activeArtifact.assumptions}
          confidence={activeArtifact.confidence}
          provider={activeArtifact.provider}
          planId={activeArtifact.planId}
          loggedMealIds={activeLoggedMealIds}
          isSaving={isSaving}
          isLoggingAll={isLoggingAll}
          loggingMealId={loggingMealId}
          onSave={() => void handleSavePlan()}
          onLogAll={() => void handleLogAll()}
          onDismiss={handleDismiss}
          onLogMeal={(meal) => void handleLogMeal(meal)}
        />
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Saved plans</h3>
        {plansLoading && <p className="text-sm text-gray-500">Loading…</p>}
        {!plansLoading && visibleSavedPlans.length === 0 && (
          <p className="text-sm text-gray-500">No saved meal plans yet.</p>
        )}
        <ul className="space-y-4">
          {visibleSavedPlans.map((plan) => {
            const planLoggedIds = getLoggedMealIds(plan.id, []);

            return (
              <li
                key={plan.id}
                className={cn(fitnessSectionClassName, fitnessSectionCompactPaddingClassName)}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {plan.title || 'Meal plan'}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(plan.createdAt).toLocaleDateString()} · {plan.meals.length} meal
                      {plan.meals.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePlanMut.mutate(plan.id)}
                    disabled={deletePlanMut.isPending}
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete plan
                  </button>
                </div>
                <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                  {plan.meals.map((meal) => {
                    const logged = planLoggedIds.has(meal.id);
                    const isLoggingThis = loggingMealId === meal.id;

                    return (
                      <li
                        key={meal.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span>
                          {meal.name}{' '}
                          <span className="text-gray-500">
                            · {Math.round(meal.calories)} kcal · {meal.mealType}
                          </span>
                        </span>
                        {logged ? (
                          <span className="text-xs text-emerald-700 dark:text-emerald-300">
                            Logged
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleLogSavedPlanMeal(plan, meal)}
                            disabled={logNutritionMut.isPending && isLoggingThis}
                            className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {isLoggingThis ? 'Logging…' : 'Log to nutrition'}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
