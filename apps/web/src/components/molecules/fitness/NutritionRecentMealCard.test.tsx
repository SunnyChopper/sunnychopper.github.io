import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NutritionRecentMealCard } from '@/components/molecules/fitness/NutritionRecentMealCard';
import { formatRelativeChatTimestamp } from '@/lib/chat/format-relative-time';
import type { NutritionEntry } from '@/types/fitness';

const entry: NutritionEntry = {
  id: 'nut-1',
  userId: 'user-1',
  loggedAt: '2026-07-29T18:00:00.000Z',
  mealType: 'dinner',
  foodName: 'Garlic Butter Chicken with Roasted Potatoes',
  sourceText: null,
  calories: 518,
  proteinGrams: 42,
  carbGrams: 38,
  fatGrams: 18,
  fiberGrams: null,
  confidence: null,
  parseProvider: null,
  parseModel: null,
  sourceMealPlanId: null,
  sourceMealSlotId: null,
  sourceRecipeId: null,
  createdAt: '2026-07-29T18:00:00.000Z',
  updatedAt: '2026-07-29T18:00:00.000Z',
};

const fixedNow = new Date(2026, 6, 29, 20, 0, 0);

describe('NutritionRecentMealCard', () => {
  describe('render', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('renders meal name, meal type, macros, and relative timestamp', () => {
      render(<NutritionRecentMealCard entry={entry} onRequestDelete={vi.fn()} />);

      expect(screen.getByText('Garlic Butter Chicken with Roasted Potatoes')).toBeInTheDocument();
      expect(screen.getByText('· dinner')).toBeInTheDocument();
      expect(screen.getByText('518 kcal · P42 C38 F18')).toBeInTheDocument();
      expect(
        screen.getByText(formatRelativeChatTimestamp(entry.loggedAt, fixedNow))
      ).toBeInTheDocument();
    });

    it('falls back to Meal when foodName is empty', () => {
      render(
        <NutritionRecentMealCard entry={{ ...entry, foodName: null }} onRequestDelete={vi.fn()} />
      );

      expect(screen.getByText('Meal')).toBeInTheDocument();
    });
  });

  it('calls onRequestDelete from trash button', async () => {
    const user = userEvent.setup();
    const onRequestDelete = vi.fn();
    render(<NutritionRecentMealCard entry={entry} onRequestDelete={onRequestDelete} />);

    await user.click(
      screen.getByRole('button', {
        name: 'Remove Garlic Butter Chicken with Roasted Potatoes',
      })
    );

    expect(onRequestDelete).toHaveBeenCalledWith(entry);
  });
});
