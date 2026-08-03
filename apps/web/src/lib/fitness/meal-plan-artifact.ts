import type {
  GeneratedMealAi,
  MealPlan,
  MealPlanMeal,
  MealType,
  NutritionEntry,
} from '@/types/fitness';

export interface ActiveMealPlanArtifact {
  planId: string | null;
  title: string;
  meals: MealPlanMeal[];
  assumptions: string[];
  confidence: number;
  provider: string;
  model: string;
  pantrySnapshot: string[];
  loggedMealIds: string[];
}

export interface NutritionCreateFromMealBody {
  loggedAt: string;
  mealType: MealType;
  foodName?: string;
  sourceText?: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  confidence?: number;
  parseProvider?: string;
  parseModel?: string;
  sourceMealPlanId?: string;
  sourceMealSlotId?: string;
  sourceRecipeId?: string;
}

export function newMealId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 26);
}

export function aiMealToPlanMeal(m: GeneratedMealAi): MealPlanMeal {
  return {
    id: newMealId(),
    name: m.name,
    mealType: m.mealType,
    ingredientsUsed: m.ingredientsUsed,
    calories: m.calories,
    proteinGrams: m.proteinGrams,
    carbGrams: m.carbGrams,
    fatGrams: m.fatGrams,
    recipeSteps: m.recipeSteps,
    confidence: m.confidence,
  };
}

export function buildNutritionCreateBody(
  plan: Pick<MealPlan, 'provider' | 'model'> | { provider: string; model: string },
  meal: MealPlanMeal,
  planId: string
): NutritionCreateFromMealBody {
  return {
    loggedAt: new Date().toISOString(),
    mealType: meal.mealType,
    foodName: meal.name,
    sourceText: meal.ingredientsUsed.length
      ? `From meal plan: ${meal.ingredientsUsed.join(', ')}`
      : undefined,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbGrams: meal.carbGrams,
    fatGrams: meal.fatGrams,
    confidence: meal.confidence ?? undefined,
    parseProvider: plan.provider ?? undefined,
    parseModel: plan.model ?? undefined,
    sourceMealPlanId: planId,
    sourceMealSlotId: meal.mealType,
    sourceRecipeId: meal.id,
  };
}

/** Merge session-logged meal ids with Recent entries matched by plan + recipe id. */
export function resolveLoggedMealIds(
  planId: string | null,
  sessionLoggedIds: string[],
  recentEntries: NutritionEntry[]
): Set<string> {
  const logged = new Set(sessionLoggedIds);
  if (!planId) return logged;

  for (const entry of recentEntries) {
    if (entry.sourceMealPlanId === planId && entry.sourceRecipeId) {
      logged.add(entry.sourceRecipeId);
    }
  }

  return logged;
}

export function isMealLogged(mealId: string, loggedMealIds: Set<string>): boolean {
  return loggedMealIds.has(mealId);
}

export function areAllMealsLogged(meals: MealPlanMeal[], loggedMealIds: Set<string>): boolean {
  if (meals.length === 0) return false;
  return meals.every((meal) => loggedMealIds.has(meal.id));
}

export function unloggedMeals(meals: MealPlanMeal[], loggedMealIds: Set<string>): MealPlanMeal[] {
  return meals.filter((meal) => !loggedMealIds.has(meal.id));
}
