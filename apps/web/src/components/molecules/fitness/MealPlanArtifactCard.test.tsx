import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MealPlanArtifactCard } from '@/components/molecules/fitness/MealPlanArtifactCard';
import type { MealPlanMeal } from '@/types/fitness';

const meals: MealPlanMeal[] = [
  {
    id: 'meal-1',
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
    id: 'meal-2',
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
];

const baseProps = {
  title: 'Weeknight plan',
  meals,
  assumptions: ['Assumes pantry staples on hand'],
  confidence: 0.88,
  provider: 'openai',
  planId: null as string | null,
  loggedMealIds: new Set<string>(),
  onSave: vi.fn(),
  onLogAll: vi.fn(),
  onDismiss: vi.fn(),
  onLogMeal: vi.fn(),
};

describe('MealPlanArtifactCard', () => {
  it('renders hero card with co-equal primary actions', () => {
    render(<MealPlanArtifactCard {...baseProps} />);

    expect(screen.getByTestId('meal-plan-artifact-card')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save plan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log all to nutrition' })).toBeInTheDocument();
    expect(screen.getByText('Chicken Bowl')).toBeInTheDocument();
  });

  it('shows Saved chip when planId is set', () => {
    render(<MealPlanArtifactCard {...baseProps} planId="plan-1" />);
    expect(screen.getByTestId('meal-plan-saved-chip')).toHaveTextContent('Saved');
  });

  it('shows Logged chip and disables Log all when all meals logged', () => {
    render(
      <MealPlanArtifactCard
        {...baseProps}
        planId="plan-1"
        loggedMealIds={new Set(['meal-1', 'meal-2'])}
      />
    );

    expect(screen.getByTestId('meal-plan-logged-chip')).toHaveTextContent('Logged');
    expect(screen.getByRole('button', { name: 'Log all to nutrition' })).toBeDisabled();
    expect(screen.getAllByText('Logged')).toHaveLength(3);
  });

  it('fires save and log all handlers', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onLogAll = vi.fn();

    render(<MealPlanArtifactCard {...baseProps} onSave={onSave} onLogAll={onLogAll} />);

    await user.click(screen.getByRole('button', { name: 'Save plan' }));
    await user.click(screen.getByRole('button', { name: 'Log all to nutrition' }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onLogAll).toHaveBeenCalledTimes(1);
  });
});
