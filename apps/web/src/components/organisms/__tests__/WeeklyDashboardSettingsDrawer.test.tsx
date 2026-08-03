import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WeeklyDashboardSettingsDrawer } from '@/components/organisms/WeeklyDashboardSettingsDrawer';
import { DEFAULT_WEEKLY_DASHBOARD_CONFIG } from '@/types/weekly-dashboard';

const mutateAsync = vi.fn().mockResolvedValue(DEFAULT_WEEKLY_DASHBOARD_CONFIG);
const onClose = vi.fn();

vi.mock('@/hooks/useWeeklyDashboardConfig', () => ({
  useWeeklyDashboardConfig: vi.fn(),
  useWeeklyDashboardConfigMutation: vi.fn(),
}));

vi.mock('@/hooks/useGrowthSystemDashboard', () => ({
  useGrowthSystemDashboard: vi.fn(),
}));

import {
  useWeeklyDashboardConfig,
  useWeeklyDashboardConfigMutation,
} from '@/hooks/useWeeklyDashboardConfig';
import { useGrowthSystemDashboard } from '@/hooks/useGrowthSystemDashboard';

function renderDrawer() {
  return render(<WeeklyDashboardSettingsDrawer open onClose={onClose} />);
}

describe('WeeklyDashboardSettingsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useWeeklyDashboardConfig).mockReturnValue({
      data: DEFAULT_WEEKLY_DASHBOARD_CONFIG,
    } as ReturnType<typeof useWeeklyDashboardConfig>);
    vi.mocked(useWeeklyDashboardConfigMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useWeeklyDashboardConfigMutation>);
    vi.mocked(useGrowthSystemDashboard).mockReturnValue({
      metrics: [{ id: 'metric-1', name: 'Sleep hours' }],
      habits: [{ id: 'habit-1', name: 'Morning run' }],
    } as ReturnType<typeof useGrowthSystemDashboard>);
  });

  it('shows a single Add widget control instead of four separate add buttons', () => {
    renderDrawer();

    expect(screen.getByRole('button', { name: 'Add widget' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Story Point Velocity/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Stat Tiles/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Metric Trend/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Habit Completion/i })).not.toBeInTheDocument();
  });

  it('adds a widget from the menu and saves the expanded layout payload', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Add widget' }));
    await user.click(screen.getByRole('menuitem', { name: 'Metric Trend' }));

    expect(screen.getAllByText('Metric Trend')).toHaveLength(1);
    expect(screen.getByLabelText('Metric')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save layout' }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    const saved = vi.mocked(mutateAsync).mock.calls[0][0];
    expect(saved.comparisonWeeks).toBe(DEFAULT_WEEKLY_DASHBOARD_CONFIG.comparisonWeeks);
    expect(saved.widgets).toHaveLength(DEFAULT_WEEKLY_DASHBOARD_CONFIG.widgets.length + 1);
    expect(
      saved.widgets.some((w: (typeof saved.widgets)[number]) => w.type === 'metricSeries')
    ).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('lists all widget types in the add menu', async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Add widget' }));

    expect(screen.getByRole('menuitem', { name: 'Story Point Velocity' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Stat Tiles' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Metric Trend' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Habit Completion' })).toBeInTheDocument();
  });
});
