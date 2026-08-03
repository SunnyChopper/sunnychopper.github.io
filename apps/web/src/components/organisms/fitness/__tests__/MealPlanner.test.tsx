import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MealPlanner } from '@/components/organisms/fitness/MealPlanner';

const mockGenerateMutateAsync = vi.fn();
const mockSavePlanMutateAsync = vi.fn();
const mockLogNutritionMutateAsync = vi.fn();

vi.mock('@/hooks/useFitness', () => ({
  useFitnessPantryList: vi.fn(),
  useFitnessMealPlansList: vi.fn(),
  useGenerateMealsMutation: vi.fn(),
  useCreateMealPlanMutation: vi.fn(),
  useDeleteMealPlanMutation: vi.fn(),
  useCreateNutritionMutation: vi.fn(),
}));

import {
  useCreateMealPlanMutation,
  useCreateNutritionMutation,
  useDeleteMealPlanMutation,
  useFitnessMealPlansList,
  useFitnessPantryList,
  useGenerateMealsMutation,
} from '@/hooks/useFitness';

const GENERATED_MEALS = {
  success: true,
  data: {
    result: {
      title: 'Pantry weeknight plan',
      meals: [
        {
          name: 'Chicken Bowl',
          mealType: 'dinner',
          ingredientsUsed: ['chicken'],
          calories: 520,
          proteinGrams: 42,
          carbGrams: 38,
          fatGrams: 18,
          recipeSteps: [],
          confidence: 0.9,
        },
        {
          name: 'Greek Salad',
          mealType: 'lunch',
          ingredientsUsed: ['lettuce'],
          calories: 320,
          proteinGrams: 12,
          carbGrams: 18,
          fatGrams: 22,
          recipeSteps: [],
          confidence: 0.85,
        },
      ],
      assumptions: ['Uses pantry staples'],
      confidence: 0.88,
    },
    confidence: 0.88,
    provider: 'openai',
    model: 'gpt-4o-mini',
    cached: false,
  },
};

function renderMealPlanner() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MealPlanner recentEntries={[]} />
    </QueryClientProvider>
  );
}

describe('MealPlanner artifact pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFitnessPantryList).mockReturnValue({
      data: {
        success: true,
        data: {
          data: [{ id: 'p1', name: 'chicken', userId: 'u1', createdAt: '', updatedAt: '' }],
          total: 1,
          page: 1,
          pageSize: 100,
          hasMore: false,
        },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessPantryList>);

    vi.mocked(useFitnessMealPlansList).mockReturnValue({
      data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 20, hasMore: false } },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitnessMealPlansList>);

    vi.mocked(useGenerateMealsMutation).mockReturnValue({
      mutateAsync: mockGenerateMutateAsync,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useGenerateMealsMutation>);

    vi.mocked(useCreateMealPlanMutation).mockReturnValue({
      mutateAsync: mockSavePlanMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateMealPlanMutation>);

    vi.mocked(useCreateNutritionMutation).mockReturnValue({
      mutateAsync: mockLogNutritionMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateNutritionMutation>);

    vi.mocked(useDeleteMealPlanMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useDeleteMealPlanMutation>);

    mockGenerateMutateAsync.mockResolvedValue(GENERATED_MEALS);
    mockSavePlanMutateAsync.mockResolvedValue({
      success: true,
      data: {
        id: 'plan-1',
        userId: 'user-1',
        title: 'Pantry weeknight plan',
        pantrySnapshot: ['chicken'],
        meals: [],
        provider: 'openai',
        model: 'gpt-4o-mini',
        createdAt: '2026-07-29T12:00:00.000Z',
        updatedAt: '2026-07-29T12:00:00.000Z',
      },
    });
    mockLogNutritionMutateAsync.mockImplementation(async (body) => ({
      success: true,
      data: {
        id: `nut-${body.sourceRecipeId}`,
        userId: 'user-1',
        loggedAt: body.loggedAt,
        mealType: body.mealType,
        foodName: body.foodName ?? null,
        sourceText: body.sourceText ?? null,
        calories: body.calories,
        proteinGrams: body.proteinGrams,
        carbGrams: body.carbGrams,
        fatGrams: body.fatGrams,
        fiberGrams: null,
        confidence: null,
        parseProvider: null,
        parseModel: null,
        sourceMealPlanId: body.sourceMealPlanId ?? null,
        sourceMealSlotId: body.sourceMealSlotId ?? null,
        sourceRecipeId: body.sourceRecipeId ?? null,
        createdAt: body.loggedAt,
        updatedAt: body.loggedAt,
      },
    }));
  });

  it('shows hero artifact with Save and Log all after generate', async () => {
    const user = userEvent.setup();
    renderMealPlanner();

    await user.click(screen.getByRole('button', { name: /Generate from pantry/i }));

    await waitFor(() => {
      expect(screen.getByTestId('meal-plan-artifact-card')).toBeInTheDocument();
    });

    const card = screen.getByTestId('meal-plan-artifact-card');
    expect(within(card).getByRole('button', { name: 'Save plan' })).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Log all to nutrition' })).toBeInTheDocument();
  });

  it('keeps hero and shows Saved after save', async () => {
    const user = userEvent.setup();
    renderMealPlanner();

    await user.click(screen.getByRole('button', { name: /Generate from pantry/i }));
    await waitFor(() => expect(screen.getByTestId('meal-plan-artifact-card')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Save plan' }));

    await waitFor(() => {
      expect(screen.getByTestId('meal-plan-saved-chip')).toBeInTheDocument();
    });
    expect(screen.getByTestId('meal-plan-artifact-card')).toBeInTheDocument();
    expect(mockSavePlanMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('save-then-logs all meals on Log all', async () => {
    const user = userEvent.setup();
    renderMealPlanner();

    await user.click(screen.getByRole('button', { name: /Generate from pantry/i }));
    await waitFor(() => expect(screen.getByTestId('meal-plan-artifact-card')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Log all to nutrition' }));

    await waitFor(() => {
      expect(mockSavePlanMutateAsync).toHaveBeenCalledTimes(1);
      expect(mockLogNutritionMutateAsync).toHaveBeenCalledTimes(2);
    });

    expect(mockLogNutritionMutateAsync.mock.calls[0]?.[0]?.sourceMealPlanId).toBe('plan-1');
    await waitFor(() => {
      expect(screen.getByTestId('meal-plan-logged-chip')).toBeInTheDocument();
    });
  });
});
