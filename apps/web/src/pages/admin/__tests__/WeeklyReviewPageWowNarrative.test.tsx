import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import WeeklyReviewPage from '@/pages/admin/WeeklyReviewPage';
import type { WeeklyReview, WeeklyReviewCurrentDashboard } from '@/types/growth-system';
import { DEFAULT_WEEKLY_DASHBOARD_CONFIG } from '@/types/weekly-dashboard';

const WEEK_START = '2026-07-21';

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
  velocityTrend: 'stable',
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
    weekEnd: '2026-07-27',
    status: 'generated',
    stats: sampleStats,
    velocityData: [{ weekStart: WEEK_START, storyPointsCompleted: 8, tasksCompleted: 3 }],
    aiAnalysis: sampleAiAnalysis,
    planActions: null,
    completionSummary: null,
    createdAt: '2026-07-21T12:00:00Z',
    updatedAt: '2026-07-21T12:00:00Z',
    ...overrides,
  };
}

const currentWithReview: WeeklyReviewCurrentDashboard = {
  weekStart: WEEK_START,
  weekEnd: '2026-07-27',
  weeklyReviewDate: '2026-07-27',
  isMidWeek: false,
  hasGeneratedReview: true,
  pendingReview: false,
  statsPartial: sampleStats,
  velocityData: [{ weekStart: WEEK_START, storyPointsCompleted: 8, tasksCompleted: 3 }],
  trailingAverageStoryPoints: 6,
  currentWeekStoryPoints: 8,
  rollingAverageStoryPoints: [5, 6, 7],
};

let snapshotData: WeeklyReview | null = makeSnapshot();
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

vi.mock('@/components/organisms/WeeklyReviewProjectRisks', () => ({
  WeeklyReviewProjectRisksSection: () => null,
}));

vi.mock('@/components/molecules/HabitVelocityInsightCallout', () => ({
  HabitVelocityInsightCallout: () => null,
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
        reviews: snapshotData
          ? [{ weekStart: snapshotData.weekStart, status: snapshotData.status }]
          : [],
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

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/admin/weekly-review']}>
        <WeeklyReviewPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('WeeklyReviewPage week-over-week narrative', () => {
  beforeEach(() => {
    snapshotData = makeSnapshot();
    snapshotLoading = false;
    currentLoading = false;
    currentData = currentWithReview;
  });

  it('renders narrative when weekOverWeekNarrative is present', () => {
    snapshotData = makeSnapshot({
      aiAnalysis: {
        ...sampleAiAnalysis,
        weekOverWeekNarrative:
          'Story points rose to 12 from 8 last week (+50%). Goals at risk moved from 1 to 2.',
      },
    });

    renderPage();

    expect(screen.getByTestId('weekly-review-wow-narrative')).toBeInTheDocument();
    expect(screen.getByText('Week over week')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Story points rose to 12 from 8 last week (+50%). Goals at risk moved from 1 to 2.'
      )
    ).toBeInTheDocument();
  });

  it('omits narrative block when weekOverWeekNarrative is blank', () => {
    snapshotData = makeSnapshot({
      aiAnalysis: {
        ...sampleAiAnalysis,
        weekOverWeekNarrative: '',
      },
    });

    renderPage();

    expect(screen.queryByTestId('weekly-review-wow-narrative')).not.toBeInTheDocument();
    expect(screen.queryByText('Week over week')).not.toBeInTheDocument();
  });
});
