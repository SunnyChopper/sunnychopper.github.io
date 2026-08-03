import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { GoalsDashboardWidget } from '@/components/organisms/GoalsDashboardWidget';
import { FOCUS_GOALS_LIST_MIN_HEIGHT_PX } from '@/lib/growth-system/focus-goals-surfaces';
import type { Goal } from '@/types/growth-system';

const weeklyGoal: Goal = {
  id: 'goal-weekly',
  title: 'Sleep & System Startup',
  description: null,
  area: 'Health',
  subCategory: null,
  timeHorizon: 'Weekly',
  priority: 'P1',
  status: 'Active',
  health: null,
  startDate: '2026-01-01',
  targetDate: '2026-05-01',
  completedDate: null,
  successCriteria: [],
  progressConfig: null,
  parentGoalId: null,
  lastActivityAt: null,
  notes: null,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const monthlyGoal: Goal = {
  ...weeklyGoal,
  id: 'goal-monthly',
  title: 'Quarterly stretch',
  timeHorizon: 'Monthly',
  priority: 'P2',
};

function renderWidget(
  goals: Goal[],
  goalsProgress: Map<string, number> = new Map([['goal-weekly', 0]]),
  isLoading = false
) {
  return render(
    <MemoryRouter>
      <GoalsDashboardWidget goals={goals} goalsProgress={goalsProgress} isLoading={isLoading} />
    </MemoryRouter>
  );
}

describe('GoalsDashboardWidget', () => {
  it('renders View all link with accessible label', () => {
    renderWidget([weeklyGoal]);

    expect(screen.getByRole('link', { name: 'View all goals' })).toHaveAttribute('href');
  });

  it('keeps list region min-height with a single goal', () => {
    const { container } = renderWidget([weeklyGoal]);

    const list = container.querySelector('[style*="min-height"]');
    expect(list).toHaveStyle({ minHeight: `${FOCUS_GOALS_LIST_MIN_HEIGHT_PX}px` });
    expect(screen.getByText('Sleep & System Startup')).toBeInTheDocument();
  });

  it('shows calm empty state inside reserved list height', () => {
    const { container } = renderWidget([]);

    expect(screen.getByText(/No active goals in this horizon yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create goal/i })).toBeInTheDocument();
    const list = container.querySelector('[style*="min-height"]');
    expect(list).toHaveStyle({ minHeight: `${FOCUS_GOALS_LIST_MIN_HEIGHT_PX}px` });
  });

  it('renders three skeleton rows while loading', () => {
    renderWidget([], new Map(), true);

    expect(screen.getByLabelText('View all goals')).toBeInTheDocument();
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
  });

  it('selects lowest timeframe lane before priority', () => {
    renderWidget(
      [monthlyGoal, weeklyGoal],
      new Map([
        ['goal-monthly', 10],
        ['goal-weekly', 0],
      ])
    );

    expect(screen.getByText('Sleep & System Startup')).toBeInTheDocument();
    expect(screen.queryByText('Quarterly stretch')).not.toBeInTheDocument();
  });
});
