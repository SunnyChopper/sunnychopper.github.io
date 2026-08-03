import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NutritionQuickAdd } from '@/components/organisms/fitness/NutritionQuickAdd';

const mockParseMutateAsync = vi.fn();
const mockCreateMutateAsync = vi.fn();

vi.mock('@/hooks/useFitness', () => ({
  useParseNutritionMutation: vi.fn(),
  useCreateNutritionMutation: vi.fn(),
}));

import { useCreateNutritionMutation, useParseNutritionMutation } from '@/hooks/useFitness';

const PARSED_RESULT = {
  foodItems: [
    {
      name: 'chicken breast',
      calories: 280,
      proteinGrams: 52,
      carbGrams: 0,
      fatGrams: 6,
    },
    {
      name: 'rice',
      calories: 200,
      proteinGrams: 4,
      carbGrams: 44,
      fatGrams: 1,
    },
  ],
  foodNameSummary: 'Chicken and rice',
  calories: 480,
  proteinGrams: 56,
  carbGrams: 44,
  fatGrams: 7,
  fiberGrams: 2,
  assumptions: ['Cooked rice assumed 1 cup'],
  confidence: 0.82,
  needsUserConfirmation: true,
};

function renderQuickAdd() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NutritionQuickAdd />
    </QueryClientProvider>
  );
}

describe('NutritionQuickAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useParseNutritionMutation).mockReturnValue({
      mutateAsync: mockParseMutateAsync,
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useParseNutritionMutation>);

    vi.mocked(useCreateNutritionMutation).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateNutritionMutation>);
  });

  it('shows skeleton while parse is pending and hides confirm actions', () => {
    vi.mocked(useParseNutritionMutation).mockReturnValue({
      mutateAsync: mockParseMutateAsync,
      isPending: true,
      isError: false,
    } as unknown as ReturnType<typeof useParseNutritionMutation>);

    renderQuickAdd();

    expect(screen.getByTestId('nutrition-parse-skeleton')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm & log' })).not.toBeInTheDocument();
  });

  it('shows compact preview with detected items and macro chips after parse', async () => {
    mockParseMutateAsync.mockResolvedValue({
      success: true,
      data: {
        result: PARSED_RESULT,
        confidence: 0.82,
        provider: 'openai',
        model: 'gpt-4o-mini',
        cached: false,
      },
    });

    const user = userEvent.setup();
    renderQuickAdd();

    await user.type(screen.getByPlaceholderText(/chicken breast/i), '8 oz chicken breast and rice');
    await user.click(screen.getByRole('button', { name: 'Parse with AI' }));

    await waitFor(() => {
      expect(screen.getByTestId('nutrition-parse-preview-card')).toBeInTheDocument();
    });

    const previewCard = screen.getByTestId('nutrition-parse-preview-card');
    expect(within(previewCard).getByText('Chicken and rice')).toBeInTheDocument();
    expect(within(previewCard).getByText('chicken breast')).toBeInTheDocument();
    expect(within(previewCard).getByText('rice')).toBeInTheDocument();
    expect(screen.getByTestId('nutrition-macro-chips')).toHaveTextContent('480 kcal');
    expect(screen.getByRole('button', { name: 'Confirm & log' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it('logs only when Confirm & log is clicked', async () => {
    mockParseMutateAsync.mockResolvedValue({
      success: true,
      data: {
        result: PARSED_RESULT,
        confidence: 0.82,
        provider: 'openai',
        model: 'gpt-4o-mini',
        cached: false,
      },
    });
    mockCreateMutateAsync.mockResolvedValue({ success: true, data: { id: 'nutrition-1' } });

    const user = userEvent.setup();
    renderQuickAdd();

    await user.type(screen.getByPlaceholderText(/chicken breast/i), 'chicken and rice');
    await user.click(screen.getByRole('button', { name: 'Parse with AI' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirm & log' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Confirm & log' }));

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        mealType: 'other',
        foodName: 'Chicken and rice',
        sourceText: 'chicken and rice',
        calories: 480,
        proteinGrams: 56,
        carbGrams: 44,
        fatGrams: 7,
        fiberGrams: 2,
        confidence: 0.82,
        parseProvider: 'openai',
        parseModel: 'gpt-4o-mini',
      })
    );
  });

  it('reveals edit inputs without logging until Confirm & log', async () => {
    mockParseMutateAsync.mockResolvedValue({
      success: true,
      data: {
        result: PARSED_RESULT,
        confidence: 0.82,
        provider: 'openai',
        model: 'gpt-4o-mini',
        cached: false,
      },
    });

    const user = userEvent.setup();
    renderQuickAdd();

    await user.type(screen.getByPlaceholderText(/chicken breast/i), 'chicken and rice');
    await user.click(screen.getByRole('button', { name: 'Parse with AI' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Edit entry')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Chicken and rice')).toBeInTheDocument();
    expect(screen.queryByTestId('nutrition-parse-preview-card')).not.toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it('clears preview when source text changes after parse', async () => {
    mockParseMutateAsync.mockResolvedValue({
      success: true,
      data: {
        result: PARSED_RESULT,
        confidence: 0.82,
        provider: 'openai',
        model: 'gpt-4o-mini',
        cached: false,
      },
    });

    const user = userEvent.setup();
    renderQuickAdd();

    await user.type(screen.getByPlaceholderText(/chicken breast/i), 'chicken and rice');
    await user.click(screen.getByRole('button', { name: 'Parse with AI' }));

    await waitFor(() => {
      expect(screen.getByTestId('nutrition-parse-preview-card')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/chicken breast/i);
    await user.type(textarea, ' plus broccoli');

    await waitFor(() => {
      expect(screen.queryByTestId('nutrition-parse-preview-card')).not.toBeInTheDocument();
    });
  });
});
