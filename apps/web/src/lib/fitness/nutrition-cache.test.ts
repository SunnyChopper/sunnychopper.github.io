import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { prependNutritionEntriesToCache } from '@/lib/fitness/nutrition-cache';
import { queryKeys } from '@/lib/react-query/query-keys';
import type { NutritionEntry } from '@/types/fitness';

const makeEntry = (id: string, loggedAt: string): NutritionEntry => ({
  id,
  userId: 'user-1',
  loggedAt,
  mealType: 'dinner',
  foodName: `Meal ${id}`,
  sourceText: null,
  calories: 400,
  proteinGrams: 30,
  carbGrams: 20,
  fatGrams: 10,
  fiberGrams: null,
  confidence: null,
  parseProvider: null,
  parseModel: null,
  sourceMealPlanId: null,
  sourceMealSlotId: null,
  sourceRecipeId: null,
  createdAt: loggedAt,
  updatedAt: loggedAt,
});

describe('prependNutritionEntriesToCache', () => {
  it('prepends entries to cached nutrition list envelopes', () => {
    const queryClient = new QueryClient();
    const filters = { startDate: '2026-07-15', endDate: '2026-07-29', pageSize: 30 };
    const key = queryKeys.fitness.nutrition.list(filters);

    queryClient.setQueryData(key, {
      success: true,
      data: {
        data: [makeEntry('existing', '2026-07-28T12:00:00.000Z')],
        total: 1,
        page: 1,
        pageSize: 30,
        hasMore: false,
      },
    });

    const incoming = [makeEntry('new-1', '2026-07-29T18:00:00.000Z')];
    prependNutritionEntriesToCache(queryClient, incoming);

    const cached = queryClient.getQueryData<{
      success: boolean;
      data: { data: NutritionEntry[] };
    }>(key);

    expect(cached?.data.data.map((entry) => entry.id)).toEqual(['new-1', 'existing']);
  });

  it('dedupes by id when prepending', () => {
    const queryClient = new QueryClient();
    const filters = { pageSize: 30 };
    const key = queryKeys.fitness.nutrition.list(filters);

    const existing = makeEntry('dup', '2026-07-28T12:00:00.000Z');
    queryClient.setQueryData(key, {
      success: true,
      data: {
        data: [existing],
        total: 1,
        page: 1,
        pageSize: 30,
        hasMore: false,
      },
    });

    prependNutritionEntriesToCache(queryClient, [
      { ...existing, foodName: 'Updated name', loggedAt: '2026-07-29T20:00:00.000Z' },
    ]);

    const cached = queryClient.getQueryData<{
      success: boolean;
      data: { data: NutritionEntry[] };
    }>(key);

    expect(cached?.data.data).toHaveLength(1);
    expect(cached?.data.data[0]?.foodName).toBe('Updated name');
  });
});
