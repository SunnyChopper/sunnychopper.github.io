import type { MealPlan } from '@/types/fitness';

export const COMMON_PANTRY_STAPLES = [
  'chicken',
  'rice',
  'eggs',
  'olive oil',
  'onion',
  'garlic',
  'butter',
  'potatoes',
] as const;

export function normalizePantryName(name: string): string {
  return name.trim().toLowerCase();
}

/** Returns names not already present (case-insensitive), preserving first-seen casing. */
export function dedupePantryNames(names: string[], existingNames: Iterable<string>): string[] {
  const existing = new Set(
    [...existingNames].map(normalizePantryName).filter((value) => value.length > 0)
  );
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of names) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = normalizePantryName(trimmed);
    if (existing.has(key) || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function extractIngredientNamesFromMealPlan(plan: MealPlan): string[] {
  if (plan.pantrySnapshot.length > 0) {
    return plan.pantrySnapshot;
  }

  const fromMeals = plan.meals.flatMap((meal) => meal.ingredientsUsed ?? []);
  return [...new Set(fromMeals)];
}

export function pickNewestMealPlan(plans: MealPlan[]): MealPlan | null {
  if (plans.length === 0) return null;

  return [...plans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}
