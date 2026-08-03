import { describe, expect, it } from 'vitest';
import type { MealPlan } from '@/types/fitness';
import {
  dedupePantryNames,
  extractIngredientNamesFromMealPlan,
  pickNewestMealPlan,
} from './pantry-staples';

function makePlan(overrides: Partial<MealPlan> & Pick<MealPlan, 'id' | 'createdAt'>): MealPlan {
  return {
    userId: 'user-1',
    title: 'Test plan',
    pantrySnapshot: [],
    meals: [],
    provider: null,
    model: null,
    updatedAt: overrides.createdAt,
    ...overrides,
  };
}

describe('dedupePantryNames', () => {
  it('skips existing names case-insensitively and within-batch duplicates', () => {
    expect(dedupePantryNames(['Rice', 'rice', 'Eggs'], ['chicken', 'RICE'])).toEqual(['Eggs']);
  });
});

describe('extractIngredientNamesFromMealPlan', () => {
  it('prefers pantrySnapshot when present', () => {
    const plan = makePlan({
      id: 'p1',
      createdAt: '2026-01-01T00:00:00.000Z',
      pantrySnapshot: ['chicken', 'rice'],
      meals: [
        {
          id: 'm1',
          name: 'Meal',
          mealType: 'dinner',
          ingredientsUsed: ['pasta'],
          calories: 0,
          proteinGrams: 0,
          carbGrams: 0,
          fatGrams: 0,
          recipeSteps: [],
          confidence: null,
        },
      ],
    });
    expect(extractIngredientNamesFromMealPlan(plan)).toEqual(['chicken', 'rice']);
  });

  it('falls back to union of meal ingredients when snapshot is empty', () => {
    const plan = makePlan({
      id: 'p1',
      createdAt: '2026-01-01T00:00:00.000Z',
      meals: [
        {
          id: 'm1',
          name: 'A',
          mealType: 'lunch',
          ingredientsUsed: ['eggs', 'butter'],
          calories: 0,
          proteinGrams: 0,
          carbGrams: 0,
          fatGrams: 0,
          recipeSteps: [],
          confidence: null,
        },
        {
          id: 'm2',
          name: 'B',
          mealType: 'dinner',
          ingredientsUsed: ['eggs', 'rice'],
          calories: 0,
          proteinGrams: 0,
          carbGrams: 0,
          fatGrams: 0,
          recipeSteps: [],
          confidence: null,
        },
      ],
    });
    expect(extractIngredientNamesFromMealPlan(plan)).toEqual(['eggs', 'butter', 'rice']);
  });
});

describe('pickNewestMealPlan', () => {
  it('returns the plan with the latest createdAt', () => {
    const older = makePlan({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z' });
    const newer = makePlan({ id: 'new', createdAt: '2026-02-01T00:00:00.000Z' });
    expect(pickNewestMealPlan([older, newer])?.id).toBe('new');
  });
});
