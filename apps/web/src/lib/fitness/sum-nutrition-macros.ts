import type { NutritionEntry } from '@/types/fitness';

export type NutritionMacroTotals = {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  fiberGrams: number;
  mealCount: number;
};

export function sumNutritionMacros(entries: NutritionEntry[]): NutritionMacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + (entry.calories ?? 0),
      proteinGrams: acc.proteinGrams + (entry.proteinGrams ?? 0),
      carbGrams: acc.carbGrams + (entry.carbGrams ?? 0),
      fatGrams: acc.fatGrams + (entry.fatGrams ?? 0),
      fiberGrams: acc.fiberGrams + (entry.fiberGrams ?? 0),
      mealCount: acc.mealCount + 1,
    }),
    {
      calories: 0,
      proteinGrams: 0,
      carbGrams: 0,
      fatGrams: 0,
      fiberGrams: 0,
      mealCount: 0,
    }
  );
}
