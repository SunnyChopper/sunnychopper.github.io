import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WeeklyDashboardGrid } from '@/components/organisms/WeeklyDashboardGrid';
import type { WeeklyReviewCurrentDashboard } from '@/types/growth-system';
import { DEFAULT_WEEKLY_DASHBOARD_CONFIG } from '@/types/weekly-dashboard';

vi.mock('@/components/organisms/widgets/weekly/VelocityWidget', () => ({
  VelocityWidget: () => <div data-testid="velocity-widget" />,
}));

vi.mock('@/components/organisms/widgets/weekly/StatTilesWidget', () => ({
  StatTilesWidget: () => <div data-testid="stat-tiles-widget" />,
}));

vi.mock('@/components/organisms/widgets/weekly/MetricSeriesWidget', () => ({
  MetricSeriesWidget: () => <div data-testid="metric-series-widget" />,
}));

vi.mock('@/components/organisms/widgets/weekly/HabitCompletionWidget', () => ({
  HabitCompletionWidget: () => <div data-testid="habit-completion-widget" />,
}));

const dashboardData: WeeklyReviewCurrentDashboard = {
  weekStart: '2026-07-27',
  weekEnd: '2026-08-02',
  weeklyReviewDate: '2026-08-02',
  isMidWeek: true,
  hasGeneratedReview: false,
  pendingReview: false,
  statsPartial: {
    tasksCompleted: 1,
    tasksPlanned: 11,
    totalStoryPoints: 3,
    completedStoryPoints: 3,
    habitCompletions: 0,
    habitTargets: 0,
    metricsLogged: 0,
    goalsActive: 27,
    goalsAtRisk: 0,
    journalEntries: 0,
  },
  velocityData: [{ weekStart: '2026-07-27', storyPointsCompleted: 3, tasksCompleted: 1 }],
  trailingAverageStoryPoints: 2,
  currentWeekStoryPoints: 3,
  rollingAverageStoryPoints: [2, 2, 3],
};

describe('WeeklyDashboardGrid', () => {
  it('renders Run weekly review now immediately before Customize when handler is provided', () => {
    const onRunWeeklyReview = vi.fn();
    const onEdit = vi.fn();

    render(
      <WeeklyDashboardGrid
        config={DEFAULT_WEEKLY_DASHBOARD_CONFIG}
        data={dashboardData}
        onEdit={onEdit}
        onRunWeeklyReview={onRunWeeklyReview}
      />
    );

    const runButton = screen.getByRole('button', { name: /Run weekly review now/i });
    const customizeButton = screen.getByRole('button', { name: /Customize/i });

    expect(runButton).toBeInTheDocument();
    expect(customizeButton).toBeInTheDocument();

    const actions = runButton.parentElement;
    expect(actions).toContainElement(runButton);
    expect(actions).toContainElement(customizeButton);
    expect(Array.from(actions?.children ?? []).map((node) => node.textContent?.trim())).toEqual([
      'Run weekly review now',
      'Customize',
    ]);
  });

  it('does not render Run weekly review now without onRunWeeklyReview', () => {
    render(
      <WeeklyDashboardGrid
        config={DEFAULT_WEEKLY_DASHBOARD_CONFIG}
        data={dashboardData}
        onEdit={vi.fn()}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Run weekly review now/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customize/i })).toBeInTheDocument();
  });

  it('invokes onRunWeeklyReview when the CTA is clicked', async () => {
    const user = userEvent.setup();
    const onRunWeeklyReview = vi.fn();

    render(
      <WeeklyDashboardGrid
        config={DEFAULT_WEEKLY_DASHBOARD_CONFIG}
        data={dashboardData}
        onEdit={vi.fn()}
        onRunWeeklyReview={onRunWeeklyReview}
      />
    );

    await user.click(screen.getByRole('button', { name: /Run weekly review now/i }));

    expect(onRunWeeklyReview).toHaveBeenCalledTimes(1);
  });
});
