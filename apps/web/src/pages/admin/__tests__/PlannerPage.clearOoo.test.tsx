import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

import PlannerPage from '@/pages/admin/PlannerPage';
import { CLEAR_OOO_CONFIRM_MESSAGE } from '@/lib/planner/blocked-days';
import type { PlannerDay, PlannerWeek } from '@/types/planner';

const mockDeleteMutateAsync = vi.fn();
const mockCreateMutateAsync = vi.fn();

let weekData: PlannerWeek;

function manualBlockedDay(overrides: Partial<PlannerDay> = {}): PlannerDay {
  return {
    date: '2026-05-19',
    capacityStoryPoints: 0,
    scheduledStoryPoints: 2,
    scheduledMinutes: 60,
    loadRatio: 0,
    capacityState: 'blocked',
    isBlocked: true,
    blockingContexts: [
      {
        id: 'exc-1',
        source: 'manual',
        kind: 'outOfOffice',
        label: 'Out of Office',
        startDate: '2026-05-19',
        endDate: '2026-05-19',
        isManual: true,
      },
    ],
    oneThingTaskId: null,
    calendarBusyMinutes: 0,
    calendarFreeMinutes: 0,
    lastGeneratedAt: null,
    blocks: [
      {
        id: 'b1',
        date: '2026-05-19',
        startAt: '2026-05-19T10:00:00',
        endAt: '2026-05-19T11:00:00',
        durationMinutes: 60,
        taskId: 'task-1',
        taskTitleSnapshot: 'Scheduled task',
        source: 'manual',
        status: 'scheduled',
        storyPointsLoad: 2,
        calendarEventId: null,
        microStepId: null,
        microStepText: null,
        createdAt: '',
        updatedAt: '',
      },
    ],
    rolloverTasks: [],
    ...overrides,
  };
}

vi.mock('@/hooks/useGrowthSystemDashboard', () => ({
  useGrowthSystemDashboard: () => ({ tasks: [] }),
}));

vi.mock('@/components/organisms/planner/PlannerOneThingPanel', () => ({
  PlannerOneThingPanel: () => null,
}));

vi.mock('@/components/organisms/planner/PlannerDayDrawer', () => ({
  PlannerDayDrawer: () => null,
}));

vi.mock('@/hooks/usePlanner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/usePlanner')>();
  return {
    ...actual,
    usePlannerWeek: () => ({
      data: weekData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
    usePlannerAutoSchedulePreview: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    usePlannerAutoScheduleCommit: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    usePatchPlannerBlock: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    usePlannerRolloverDecision: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
    useCreateSchedulingException: () => ({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    }),
    useDeleteSchedulingException: () => ({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    }),
  };
});

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={['/admin/planner?date=2026-05-19']}>
      <QueryClientProvider client={qc}>
        <PlannerPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('PlannerPage clear Out of Office', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMutateAsync.mockResolvedValue(undefined);
    mockCreateMutateAsync.mockResolvedValue({});
    weekData = {
      weekStart: '2026-05-18',
      weekEnd: '2026-05-24',
      timeZone: 'UTC',
      velocity: {
        dailyCapacityStoryPoints: 3,
        trailingWeeklyAverageStoryPoints: 10,
        dailyBurnRate: 2,
        confidence: 'high',
      },
      days: [manualBlockedDay()],
    };
  });

  it('confirms before clearing manual OOO when day has scheduled work', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByLabelText('Clear Out of Office for 2026-05-19'));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith(CLEAR_OOO_CONFIRM_MESSAGE);
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith('exc-1');
    });
    confirmSpy.mockRestore();
  });

  it('skips confirm when manual OOO day has no scheduled work', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    weekData = {
      ...weekData,
      days: [manualBlockedDay({ scheduledStoryPoints: 0, blocks: [] })],
    };
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByLabelText('Clear Out of Office for 2026-05-19'));

    await waitFor(() => {
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith('exc-1');
    });
    confirmSpy.mockRestore();
  });

  it('does not create manual exception when day is blocked by standby', async () => {
    weekData = {
      ...weekData,
      days: [
        manualBlockedDay({
          blockingContexts: [
            {
              id: 'standby-1',
              source: 'standby',
              kind: 'outOfOffice',
              label: 'OOO Standby',
              startDate: '2026-05-19',
              endDate: '2026-05-21',
              isManual: false,
            },
          ],
        }),
      ],
    };
    renderPage();

    expect(screen.queryByLabelText('Clear Out of Office for 2026-05-19')).not.toBeInTheDocument();
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
    expect(mockDeleteMutateAsync).not.toHaveBeenCalled();
  });
});
