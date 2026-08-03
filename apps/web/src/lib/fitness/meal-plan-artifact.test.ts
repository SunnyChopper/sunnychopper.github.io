import { describe, expect, it } from 'vitest';
import {
  aiMealToPlanMeal,
  areAllMealsLogged,
  buildNutritionCreateBody,
  resolveLoggedMealIds,
  unloggedMeals,
} from '@/lib/fitness/meal-plan-artifact';
import type { GeneratedMealAi, MealPlanMeal, NutritionEntry } from '@/types/fitness';

const generatedMeal: GeneratedMealAi = {
  name: 'Chicken Bowl',
  mealType: 'dinner',
  ingredientsUsed: ['chicken', 'rice'],
  calories: 520,
  proteinGrams: 42,
  carbGrams: 38,
  fatGrams: 18,
  recipeSteps: ['Cook rice', 'Grill chicken'],
  confidence: 0.9,
};

const planMeal: MealPlanMeal = {
  id: 'meal-abc',
  ...generatedMeal,
};

const entry: NutritionEntry = {
  id: 'nut-1',
  userId: 'user-1',
  loggedAt: '2026-07-29T18:00:00.000Z',
  mealType: 'dinner',
  foodName: 'Chicken Bowl',
  sourceText: null,
  calories: 520,
  proteinGrams: 42,
  carbGrams: 38,
  fatGrams: 18,
  fiberGrams: null,
  confidence: null,
  parseProvider: null,
  parseModel: null,
  sourceMealPlanId: 'plan-1',
  sourceMealSlotId: 'dinner',
  sourceRecipeId: 'meal-abc',
  createdAt: '2026-07-29T18:00:00.000Z',
  updatedAt: '2026-07-29T18:00:00.000Z',
};

describe('meal-plan-artifact helpers', () => {
  it('maps AI meal to plan meal with stable id', () => {
    const mapped = aiMealToPlanMeal(generatedMeal);
    expect(mapped.name).toBe('Chicken Bowl');
    expect(mapped.id).toHaveLength(26);
    expect(mapped.recipeSteps).toEqual(['Cook rice', 'Grill chicken']);
  });

  it('builds nutrition create body with provenance', () => {
    const body = buildNutritionCreateBody(
      { provider: 'openai', model: 'gpt-4o-mini' },
      planMeal,
      'plan-1'
    );

    expect(body.foodName).toBe('Chicken Bowl');
    expect(body.sourceMealPlanId).toBe('plan-1');
    expect(body.sourceRecipeId).toBe('meal-abc');
    expect(body.sourceMealSlotId).toBe('dinner');
    expect(body.sourceText).toContain('chicken');
  });

  it('merges session and recent logged meal ids', () => {
    const logged = resolveLoggedMealIds('plan-1', ['meal-other'], [entry]);
    expect(logged.has('meal-abc')).toBe(true);
    expect(logged.has('meal-other')).toBe(true);
  });

  it('detects when all meals are logged', () => {
    const meals = [planMeal, { ...planMeal, id: 'meal-def', name: 'Salad' }];
    const logged = new Set(['meal-abc', 'meal-def']);
    expect(areAllMealsLogged(meals, logged)).toBe(true);
    expect(unloggedMeals(meals, new Set(['meal-abc']))).toHaveLength(1);
  });
});
