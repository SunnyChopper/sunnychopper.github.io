import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import WeeklyReviewPage from '@/pages/admin/WeeklyReviewPage';
import type { WeeklyReview, WeeklyReviewCurrentDashboard } from '@/types/growth-system';
import { DEFAULT_WEEKLY_DASHBOARD_CONFIG } from '@/types/weekly-dashboard';

const WEEK_START = '2026-05-19';
const PAST_WEEK = '2026-05-12';

const sampleStats = {
  tasksCompleted: 3,
  tasksPlanned: 5,
  totalStoryPoints: 10,
  completedStoryPoints: 8,
  habitCompletions: 4,
  habitTargets: 7,
  metricsLogged: 2,
  goalsActive: 1,
  goalsAtRisk: 0,
  journalEntries: 1,
};

const sampleAiAnalysis = {
  tasksSummary: 'Good week',
  overdueTasks: [],
  velocityTrend: 'up',
  habitsSummary: 'Solid',
  habitsOnTarget: true,
  habitsAiMessage: 'Keep going',
  metricsSummary: 'Logged',
  metricDeltas: [],
  goalsSummary: 'On track',
  atRiskAlerts: [],
  logbookSummary: 'Quiet',
  quarantineCandidates: [],
  techDebtCandidates: [],
  suggestedTasks: [],
  hypeSummary: 'Nice work',
};

function makeSnapshot(overrides?: Partial<WeeklyReview>): WeeklyReview {
  return {
    id: 'wr-1',
    weekStart: WEEK_START,
    weekEnd: '2026-05-25',
    status: 'completed',
    stats: sampleStats,
    velocityData: [{ weekStart: WEEK_START, storyPointsCompleted: 8, tasksCompleted: 3 }],
    aiAnalysis: sampleAiAnalysis,
    planActions: null,
    completionSummary: null,
    createdAt: '2026-05-19T12:00:00Z',
    updatedAt: '2026-05-19T12:00:00Z',
    ...overrides,
  };
}

const currentWithReview: WeeklyReviewCurrentDashboard = {
  weekStart: WEEK_START,
  weekEnd: '2026-05-25',
  weeklyReviewDate: '2026-05-25',
  isMidWeek: false,
  hasGeneratedReview: true,
  pendingReview: false,
  statsPartial: sampleStats,
  velocityData: [{ weekStart: WEEK_START, storyPointsCompleted: 8, tasksCompleted: 3 }],
  trailingAverageStoryPoints: 6,
  currentWeekStoryPoints: 8,
  rollingAverageStoryPoints: [5, 6, 7],
};

let snapshotData: WeeklyReview | null = null;
let snapshotLoading = false;
let currentLoading = false;
let currentData: WeeklyReviewCurrentDashboard = currentWithReview;

vi.mock('@/hooks/useGrowthSystemDashboard', () => ({
  useGrowthSystemDashboard: () => ({ tasks: [] }),
}));

vi.mock('@/hooks/growth-system', () => ({
  useGoals: () => ({ goals: [] }),
}));

vi.mock('@/hooks/useWeeklyDashboardConfig', () => ({
  useWeeklyDashboardConfig: () => ({ data: DEFAULT_WEEKLY_DASHBOARD_CONFIG }),
}));

vi.mock('@/components/organisms/WeeklyDashboardGrid', () => ({
  WeeklyDashboardGrid: () => <div data-testid="weekly-dashboard-grid" />,
}));

vi.mock('@/components/organisms/WeeklyDashboardSettingsDrawer', () => ({
  WeeklyDashboardSettingsDrawer: () => null,
}));

vi.mock('@/components/organisms/widgets/weekly/LeverageRoiRetrospectiveWidget', () => ({
  LeverageRoiRetrospectiveWidget: () => null,
}));

vi.mock('@/components/molecules/VelocityChart', () => ({
  VelocityChart: () => <div data-testid="velocity-chart" />,
}));

vi.mock('@/components/organisms/QuarantineZone', () => ({
  QuarantineZone: () => null,
}));

vi.mock('@/components/organisms/AccumulatedTechDebt', () => ({
  AccumulatedTechDebt: () => null,
}));

vi.mock('@/components/organisms/BlockerResolution', () => ({
  BlockerResolution: () => null,
}));

vi.mock('@/components/organisms/AISuggestedTasks', () => ({
  AISuggestedTasks: () => null,
}));

vi.mock('@/hooks/useWeeklyReview', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useWeeklyReview')>();
  return {
    ...actual,
    useWeeklyReviewCurrent: () => ({
      data: currentData,
      isLoading: currentLoading,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }),
    useWeeklyReviewList: () => ({
      data: {
        reviews: [{ weekStart: PAST_WEEK, status: 'completed', autoCompleted: false }],
        page: 1,
        pageSize: 30,
        total: 1,
        hasMore: false,
      },
    }),
    useWeeklyReviewSnapshot: () => ({
      data: snapshotData,
      isLoading: snapshotLoading,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }),
    useWeeklyReviewLeverageRoi: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    }),
    useWeeklyReviewMutations: () => ({
      generate: { mutateAsync: vi.fn(), isPending: false },
      savePlan: { mutateAsync: vi.fn(), isPending: false },
      complete: { mutateAsync: vi.fn(), isPending: false },
      suggestTasks: { mutateAsync: vi.fn(), isPending: false },
      discard: { mutateAsync: vi.fn(), isPending: false },
    }),
    useSendWeeklyReviewEmail: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

function renderPage(initialEntry = `/admin/weekly-review?week=${PAST_WEEK}`) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={qc}>
        <WeeklyReviewPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('WeeklyReviewPage week-switch skeleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    snapshotData = null;
    snapshotLoading = true;
    currentLoading = false;
    currentData = { ...currentWithReview };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows geometry-matched skeleton while snapshot loads for a selected week', () => {
    renderPage();

    expect(screen.getByTestId('weekly-review-week-switch-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/Loading this week/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Week summary')).not.toBeInTheDocument();
  });

  it('replaces skeleton with review content when snapshot settles', () => {
    snapshotData = makeSnapshot({
      weekStart: PAST_WEEK,
      weekEnd: '2026-05-18',
      status: 'generated',
    });
    snapshotLoading = false;

    renderPage();

    expect(screen.queryByTestId('weekly-review-week-switch-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('Week summary')).toBeInTheDocument();
    expect(screen.getByText('AI insights')).toBeInTheDocument();
  });

  it('shows skeleton during initial current load', () => {
    currentLoading = true;
    snapshotLoading = false;
    snapshotData = null;

    renderPage('/admin/weekly-review');

    expect(screen.getByTestId('weekly-review-week-switch-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/Loading your weekly review/i)).not.toBeInTheDocument();
  });
});
