import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import DashboardPage from '@/pages/admin/DashboardPage';

const WORK_MODE_KPI_TITLES = [
  'Active Tasks',
  'Metrics Tracked',
  'Active Goals',
  'Active Projects',
  'Active Habits',
  'Journal Entries',
] as const;

vi.mock('@/hooks/useGrowthSystemDashboard', () => ({
  useGrowthSystemDashboard: () => ({
    tasks: [],
    goals: [],
    projects: [],
    habits: [],
    metrics: [],
    logbookEntries: [],
    isLoading: true,
    isError: false,
    error: null,
    data: undefined,
  }),
}));

vi.mock('@/contexts/Mode', () => ({
  useMode: () => ({ isLeisureMode: false }),
}));

vi.mock('@/contexts/BackendStatusContext', () => ({
  useBackendStatus: () => ({
    status: { isOnline: true, lastError: null, isChecking: false },
    recordError: vi.fn(),
    recordSuccess: vi.fn(),
  }),
}));

vi.mock('@/components/organisms/assistant/AmbientPresenceStrip', () => ({
  AmbientPresenceStrip: () => null,
}));

vi.mock('@/components/organisms/HealthActionWidget', () => ({
  HealthActionWidget: () => null,
}));

vi.mock('@/components/organisms/DailyPlanningAssistant', () => ({
  DailyPlanningAssistant: () => <div data-testid="daily-planning-assistant" />,
}));

vi.mock('@/components/organisms/MorningLaunchpad', () => ({
  MorningLaunchpad: () => null,
}));

vi.mock('@/components/organisms/GoalsDashboardWidget', () => ({
  GoalsDashboardWidget: () => <div data-testid="goals-dashboard-widget" />,
}));

vi.mock('@/components/organisms/AIInsightsWidget', () => ({
  AIInsightsWidget: () => <div data-testid="ai-insights-widget" />,
}));

vi.mock('@/components/molecules/StaleVelocityAdvisoryCard', () => ({
  StaleVelocityAdvisoryCard: () => null,
}));

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DashboardPage KPI loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders six busy KPI links with titles and no misleading zero values', () => {
    renderDashboard();

    const busyLinks = screen.getAllByRole('link', { busy: true });
    expect(busyLinks).toHaveLength(6);

    for (const title of WORK_MODE_KPI_TITLES) {
      expect(screen.getByRole('link', { name: new RegExp(title, 'i') })).toBeInTheDocument();
    }

    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
