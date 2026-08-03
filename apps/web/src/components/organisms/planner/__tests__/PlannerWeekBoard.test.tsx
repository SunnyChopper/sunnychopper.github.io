import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlannerWeekBoard } from '@/components/organisms/planner/PlannerWeekBoard';
import type { PlannerDay, PlannerWeek } from '@/types/planner';

vi.mock('@/lib/planner/week', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/planner/week')>();
  return {
    ...actual,
    todayISOLocal: () => '2026-01-01',
  };
});

function makeDay(date: string, partial: Partial<PlannerDay> = {}): PlannerDay {
  return {
    date,
    capacityStoryPoints: 3.4,
    scheduledStoryPoints: 0,
    scheduledMinutes: 0,
    loadRatio: 0,
    capacityState: 'healthy',
    oneThingTaskId: null,
    calendarBusyMinutes: 0,
    calendarFreeMinutes: 0,
    lastGeneratedAt: null,
    blocks: [],
    rolloverTasks: [],
    ...partial,
  };
}

function makeWeek(days: PlannerDay[]): PlannerWeek {
  return {
    weekStart: days[0]?.date ?? '2026-07-27',
    weekEnd: days[days.length - 1]?.date ?? '2026-08-02',
    timeZone: 'America/Chicago',
    days,
    velocity: {
      dailyCapacityStoryPoints: 3.4,
      trailingWeeklyAverageStoryPoints: 17,
      dailyBurnRate: 3.4,
      confidence: 'medium',
    },
  };
}

describe('PlannerWeekBoard keyboard navigation', () => {
  const week = makeWeek([makeDay('2026-07-27'), makeDay('2026-07-28'), makeDay('2026-07-29')]);

  it('moves focus with ArrowRight and opens Plan Day on Enter', () => {
    const onSelectDay = vi.fn();
    render(<PlannerWeekBoard week={week} focusDate="2026-07-27" onSelectDay={onSelectDay} />);

    const firstHeader = screen.getByLabelText('Plan day Mon 07-27');
    const secondHeader = screen.getByLabelText('Plan day Tue 07-28');

    firstHeader.focus();
    expect(document.activeElement).toBe(firstHeader);

    fireEvent.keyDown(firstHeader, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(secondHeader);

    fireEvent.keyDown(secondHeader, { key: 'Enter' });
    expect(onSelectDay).toHaveBeenCalledWith('2026-07-28');
  });

  it('moves focus with ArrowLeft and Home/End', () => {
    render(<PlannerWeekBoard week={week} focusDate="2026-07-28" />);

    const firstHeader = screen.getByLabelText('Plan day Mon 07-27');
    const middleHeader = screen.getByLabelText('Plan day Tue 07-28');
    const lastHeader = screen.getByLabelText('Plan day Wed 07-29');

    middleHeader.focus();

    fireEvent.keyDown(middleHeader, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(firstHeader);

    fireEvent.keyDown(firstHeader, { key: 'End' });
    expect(document.activeElement).toBe(lastHeader);

    fireEvent.keyDown(lastHeader, { key: 'Home' });
    expect(document.activeElement).toBe(firstHeader);
  });

  it('opens Plan Day on Space from focused header', () => {
    const onSelectDay = vi.fn();
    render(<PlannerWeekBoard week={week} focusDate="2026-07-29" onSelectDay={onSelectDay} />);

    const thirdHeader = screen.getByLabelText('Plan day Wed 07-29');
    thirdHeader.focus();
    fireEvent.keyDown(thirdHeader, { key: ' ' });
    expect(onSelectDay).toHaveBeenCalledWith('2026-07-29');
  });
});

describe('PlannerWeekBoard past-week empty state', () => {
  it('shows a calm empty message for a fully past week with no planned work', () => {
    const pastWeek = makeWeek([
      makeDay('2025-12-22'),
      makeDay('2025-12-23'),
      makeDay('2025-12-24'),
    ]);
    pastWeek.weekStart = '2025-12-22';
    pastWeek.weekEnd = '2025-12-28';

    render(<PlannerWeekBoard week={pastWeek} focusDate="2025-12-22" />);

    expect(screen.getByRole('status', { name: 'No planned work this week' })).toBeInTheDocument();
    expect(screen.getByText('No planned work this week')).toBeInTheDocument();
    expect(screen.queryByLabelText('Plan day Mon 12-22')).not.toBeInTheDocument();
  });

  it('keeps day columns for current or future empty weeks', () => {
    const futureWeek = makeWeek([
      makeDay('2026-07-27'),
      makeDay('2026-07-28'),
      makeDay('2026-07-29'),
    ]);

    render(<PlannerWeekBoard week={futureWeek} focusDate="2026-07-27" />);

    expect(screen.queryByText('No planned work this week')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Mon 07-27')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Tue 07-28')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Wed 07-29')).toBeInTheDocument();
  });

  it('keeps day columns for a past week with scheduled work', () => {
    const pastWeekWithWork = makeWeek([
      makeDay('2025-12-22'),
      makeDay('2025-12-23', {
        blocks: [
          {
            id: 'b1',
            date: '2025-12-23',
            startAt: '',
            endAt: '',
            durationMinutes: 60,
            taskId: 't1',
            taskTitleSnapshot: 'Task',
            source: 'manual',
            status: 'scheduled',
            storyPointsLoad: 1,
            calendarEventId: null,
            microStepId: null,
            microStepText: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
      }),
      makeDay('2025-12-24'),
    ]);
    pastWeekWithWork.weekStart = '2025-12-22';
    pastWeekWithWork.weekEnd = '2025-12-28';

    render(<PlannerWeekBoard week={pastWeekWithWork} focusDate="2025-12-23" />);

    expect(screen.queryByText('No planned work this week')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Mon 12-22')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Tue 12-23')).toBeInTheDocument();
    expect(screen.getByLabelText('Plan day Wed 12-24')).toBeInTheDocument();
  });
});
