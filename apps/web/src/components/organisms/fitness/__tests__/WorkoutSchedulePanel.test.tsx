import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import WorkoutSchedulePanel from '@/components/organisms/fitness/WorkoutSchedulePanel';
import {
  BEGINNER_SCHEDULE_ROLES,
  cycleScheduleRole,
  defaultWeekdayEntries,
  resolveDayCellStatus,
  swapWeekdayEntries,
} from '@/lib/fitness/workout-schedule-roles';
import type { ScheduledWorkoutDay, WorkoutTemplate } from '@/types/fitness';

const TODAY = '2026-07-29';

vi.mock('@/lib/date/local-calendar', () => ({
  localCalendarDate: () => TODAY,
  addCalendarDays: (iso: string, delta: number) => {
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, '0');
    const nd = String(dt.getDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  },
}));

const upsertMutateAsync = vi.fn();
const patchMutateAsync = vi.fn();
const submitSkipMutateAsync = vi.fn();

vi.mock('@/hooks/useFitness', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useFitness')>();
  return {
    ...actual,
    useWorkoutSchedule: vi.fn(),
    useScheduledWorkoutDays: vi.fn(),
    usePendingWorkoutSkips: vi.fn(),
    useFitnessTemplates: vi.fn(),
    useUpsertWorkoutScheduleMutation: vi.fn(),
    usePatchScheduledWorkoutDayMutation: vi.fn(),
    useSubmitWorkoutSkipReasonMutation: vi.fn(),
  };
});

import {
  useFitnessTemplates,
  usePendingWorkoutSkips,
  usePatchScheduledWorkoutDayMutation,
  useScheduledWorkoutDays,
  useSubmitWorkoutSkipReasonMutation,
  useUpsertWorkoutScheduleMutation,
  useWorkoutSchedule,
} from '@/hooks/useFitness';

function renderPanel() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <WorkoutSchedulePanel />
    </QueryClientProvider>
  );
}

const SAMPLE_SCHEDULE = {
  userId: 'u1',
  weekdays: defaultWeekdayEntries(),
  timeZone: 'America/Chicago',
  isActive: true,
  penaltyMin: 25,
  penaltyMax: 100,
  reasonGraceHours: 48,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function mockScheduleQueries({
  schedule = null as unknown,
  templates = [] as WorkoutTemplate[],
  weekDays = [] as ScheduledWorkoutDay[],
}: {
  schedule?: unknown;
  templates?: WorkoutTemplate[];
  weekDays?: ScheduledWorkoutDay[];
}) {
  vi.mocked(useWorkoutSchedule).mockReturnValue({
    data: schedule === null ? { success: true, data: null } : { success: true, data: schedule },
    isLoading: false,
  } as ReturnType<typeof useWorkoutSchedule>);

  vi.mocked(useScheduledWorkoutDays).mockReturnValue({
    data: { success: true, data: { days: weekDays } },
  } as unknown as ReturnType<typeof useScheduledWorkoutDays>);

  vi.mocked(usePendingWorkoutSkips).mockReturnValue({
    data: { success: true, data: { days: [] } },
  } as unknown as ReturnType<typeof usePendingWorkoutSkips>);

  vi.mocked(useFitnessTemplates).mockReturnValue({
    data: {
      success: true,
      data: { data: templates, total: templates.length, page: 1, pageSize: 50 },
    },
  } as ReturnType<typeof useFitnessTemplates>);

  vi.mocked(useUpsertWorkoutScheduleMutation).mockReturnValue({
    mutateAsync: upsertMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpsertWorkoutScheduleMutation>);

  vi.mocked(usePatchScheduledWorkoutDayMutation).mockReturnValue({
    mutateAsync: patchMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof usePatchScheduledWorkoutDayMutation>);

  vi.mocked(useSubmitWorkoutSkipReasonMutation).mockReturnValue({
    mutateAsync: submitSkipMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useSubmitWorkoutSkipReasonMutation>);
}

describe('workout-schedule-roles helpers', () => {
  it('defaultWeekdayEntries uses beginner PPL cadence', () => {
    const entries = defaultWeekdayEntries();
    expect(entries.map((e) => e.dayType)).toEqual([
      'workout',
      'workout',
      'workout',
      'rest',
      'workout',
      'workout',
      'rest',
    ]);
    expect([...BEGINNER_SCHEDULE_ROLES]).toEqual([
      'push',
      'pull',
      'legs',
      'rest',
      'push',
      'pull',
      'rest',
    ]);
  });

  it('cycleScheduleRole advances push to pull', () => {
    expect(cycleScheduleRole('push')).toBe('pull');
    expect(cycleScheduleRole('rest')).toBe('push');
  });

  it('swapWeekdayEntries swaps weekday payloads', () => {
    const entries = defaultWeekdayEntries();
    const swapped = swapWeekdayEntries(entries, 0, 3);
    expect(swapped[0].dayType).toBe('rest');
    expect(swapped[3].dayType).toBe('workout');
    expect(swapped[0].weekday).toBe(0);
    expect(swapped[3].weekday).toBe(3);
  });

  it('resolveDayCellStatus returns null without a saved schedule', () => {
    expect(
      resolveDayCellStatus({ scheduleExists: false, weekDayStatus: 'completed', role: 'push' })
    ).toBeNull();
  });

  it('resolveDayCellStatus prefers week day status when schedule exists', () => {
    expect(
      resolveDayCellStatus({ scheduleExists: true, weekDayStatus: 'completed', role: 'push' })
    ).toBe('completed');
  });

  it('resolveDayCellStatus falls back to role when week day row missing', () => {
    expect(resolveDayCellStatus({ scheduleExists: true, role: 'rest' })).toBe('rest');
    expect(resolveDayCellStatus({ scheduleExists: true, role: 'push' })).toBe('scheduled');
  });
});

describe('WorkoutSchedulePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMutateAsync.mockResolvedValue({ success: true, data: {} });
    mockScheduleQueries({});
  });

  it('shows beginner roles when no schedule exists', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: /Mon: Push/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tue: Pull/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Wed: Legs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thu: Rest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fri: Push/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sat: Pull/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sun: Rest/i })).toBeInTheDocument();
    expect(screen.queryByText('completed')).not.toBeInTheDocument();
    expect(screen.queryByText('scheduled')).not.toBeInTheDocument();
  });

  it('cycles Monday from Push to Pull on click', async () => {
    const user = userEvent.setup();
    renderPanel();
    const monday = screen.getByRole('button', { name: /Mon: Push/i });
    await user.click(monday);
    expect(screen.getByRole('button', { name: /Mon: Pull/i })).toBeInTheDocument();
  });

  it('drag-swaps Monday and Thursday roles', () => {
    renderPanel();
    const mondayCard = screen
      .getByRole('button', { name: /Mon: Push/i })
      .closest('[draggable="true"]');
    const thursdayCard = screen
      .getByRole('button', { name: /Thu: Rest/i })
      .closest('[draggable="true"]');
    expect(mondayCard).toBeTruthy();
    expect(thursdayCard).toBeTruthy();

    fireEvent.dragStart(mondayCard!);
    fireEvent.dragOver(thursdayCard!);
    fireEvent.drop(thursdayCard!);

    expect(screen.getByRole('button', { name: /Mon: Rest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thu: Push/i })).toBeInTheDocument();
  });

  it('shows save confirmation after Create schedule', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: /Create schedule/i }));

    await waitFor(() => {
      expect(upsertMutateAsync).toHaveBeenCalled();
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Schedule saved · skip accountability armed'
    );
  });

  it('preserves saved all-rest schedule from server', () => {
    mockScheduleQueries({
      schedule: {
        userId: 'u1',
        weekdays: Array.from({ length: 7 }, (_, weekday) => ({
          weekday,
          dayType: 'rest',
          templateId: null,
        })),
        timeZone: 'America/Chicago',
        isActive: true,
        penaltyMin: 25,
        penaltyMax: 100,
        reasonGraceHours: 48,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    });
    renderPanel();
    const restButtons = screen.getAllByRole('button', { name: /: Rest\./i });
    expect(restButtons).toHaveLength(7);
  });

  it('shows this-week status on baseline day cells when schedule exists', () => {
    mockScheduleQueries({
      schedule: SAMPLE_SCHEDULE,
      weekDays: [
        {
          date: '2026-07-27',
          userId: 'u1',
          dayType: 'workout',
          status: 'completed',
          isOverride: false,
        },
        {
          date: '2026-07-28',
          userId: 'u1',
          dayType: 'workout',
          status: 'scheduled',
          isOverride: false,
        },
        {
          date: '2026-07-30',
          userId: 'u1',
          dayType: 'rest',
          status: 'rest',
          isOverride: false,
        },
      ],
    });
    renderPanel();

    const mondayCard = screen
      .getByRole('button', { name: /Mon: Push/i })
      .closest('[draggable="true"]') as HTMLElement;
    const tuesdayCard = screen
      .getByRole('button', { name: /Tue: Push/i })
      .closest('[draggable="true"]') as HTMLElement;
    const thursdayCard = screen
      .getByRole('button', { name: /Thu: Rest/i })
      .closest('[draggable="true"]') as HTMLElement;
    const fridayCard = screen
      .getByRole('button', { name: /Fri: Push/i })
      .closest('[draggable="true"]') as HTMLElement;

    expect(within(mondayCard).getByText('completed')).toBeInTheDocument();
    expect(within(tuesdayCard).getByText('scheduled')).toBeInTheDocument();
    expect(within(thursdayCard).getByText('rest')).toBeInTheDocument();
    expect(within(fridayCard).getByText('scheduled')).toBeInTheDocument();
  });
});
