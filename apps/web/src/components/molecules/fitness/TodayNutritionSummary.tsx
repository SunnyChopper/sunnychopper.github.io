import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { NutritionMacroChips } from '@/components/molecules/fitness/NutritionMacroChips';
import { useFitnessNutritionList } from '@/hooks/useFitness';
import { localCalendarDate } from '@/lib/date/local-calendar';
import { fitnessCapacityZoneClassName } from '@/lib/fitness/fitness-surfaces';
import { sumNutritionMacros } from '@/lib/fitness/sum-nutrition-macros';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';

export function TodayNutritionSummary() {
  const today = localCalendarDate();
  const { data: nutritionRes, isLoading } = useFitnessNutritionList({
    startDate: today,
    endDate: today,
    page: 1,
    pageSize: 50,
  });

  const entries = nutritionRes?.success ? (nutritionRes.data?.data ?? []) : [];
  const totals = useMemo(() => sumNutritionMacros(entries), [entries]);

  return (
    <section
      className={cn(fitnessCapacityZoneClassName)}
      aria-label="Today's nutrition"
      data-testid="capacity-nutrition-summary"
    >
      <div className="flex items-start gap-3">
        <Coffee className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Nutrition
          </p>
          {isLoading ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
          ) : totals.mealCount === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No meals logged ·{' '}
              <Link
                to={ROUTES.admin.healthFitnessNutrition}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Log food
              </Link>
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {totals.mealCount} meal{totals.mealCount === 1 ? '' : 's'} today
              </p>
              <NutritionMacroChips
                calories={Math.round(totals.calories)}
                proteinGrams={Math.round(totals.proteinGrams)}
                carbGrams={Math.round(totals.carbGrams)}
                fatGrams={Math.round(totals.fatGrams)}
                fiberGrams={totals.fiberGrams > 0 ? Math.round(totals.fiberGrams) : undefined}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
