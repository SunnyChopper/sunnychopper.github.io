import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { DailyPlanningAssistant } from '@/components/organisms/DailyPlanningAssistant';
import type { Task } from '@/types/growth-system';
import { selectTop3TasksForToday } from '@/lib/planner/select-top3-tasks-for-today';

vi.mock('@/lib/planner/select-top3-tasks-for-today', () => ({
  selectTop3TasksForToday: vi.fn(() => []),
}));

vi.mock('@/hooks/useGrowthSystem', () => ({
  useTasks: () => ({ tasks: [], isLoading: false, isError: false }),
  useHabits: () => ({ habits: [], isLoading: false, isError: false }),
  useMetrics: () => ({ metrics: [], isLoading: false, isError: false }),
}));

vi.mock('@/hooks/usePlanner', () => ({
  usePlannerWeek: () => ({ data: undefined }),
}));

function makeTask(id: string, title: string, priority: Task['priority'] = 'P1'): Task {
  return {
    id,
    title,
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority,
    status: 'Not Started',
    size: 8,
    dueDate: '2026-07-09',
    scheduledDate: null,
    completedDate: null,
    notes: null,
    isRecurring: false,
    recurrenceRule: null,
    pointValue: null,
    pointsAwarded: null,
    projectIds: [],
    goalIds: [],
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

async function renderAssistant(props: { onStartDay?: () => void } = {}) {
  const onStartDay = props.onStartDay ?? vi.fn();
  const view = render(
    <MemoryRouter>
      <DailyPlanningAssistant onStartDay={onStartDay} />
    </MemoryRouter>
  );
  await vi.advanceTimersByTimeAsync(500);
  return { ...view, onStartDay };
}

describe('DailyPlanningAssistant ritual polish', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(selectTop3TasksForToday).mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Start Day and calls onStartDay when clicked', async () => {
    const onStartDay = vi.fn();
    vi.mocked(selectTop3TasksForToday).mockReturnValue([
      makeTask('top-1', 'Read Textbook Lesson 3'),
    ]);

    await renderAssistant({ onStartDay });

    const startDay = screen.getByRole('button', { name: /start day/i });
    expect(startDay).toBeInTheDocument();
    fireEvent.click(startDay);
    expect(onStartDay).toHaveBeenCalledTimes(1);
  });

  it('shows rank 1, priority badge, and no decorative chevron for a Top 3 task', async () => {
    vi.mocked(selectTop3TasksForToday).mockReturnValue([
      makeTask('top-1', 'Read Textbook and Complete Homework'),
    ]);

    const { container } = await renderAssistant();

    expect(screen.getByText('Read Textbook and Complete Homework')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('8pts')).toBeInTheDocument();
    expect(container.querySelector('.lucide-chevron-right')).not.toBeInTheDocument();
  });

  it('shows calm empty state with Open Planner when no Top 3 tasks', async () => {
    await renderAssistant();

    expect(screen.getByText('No Top 3 for today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open planner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view tasks/i })).toBeInTheDocument();
  });

  it('labels expand control for habits and metrics instead of Show More', async () => {
    await renderAssistant();

    expect(screen.queryByRole('button', { name: /show more/i })).not.toBeInTheDocument();
    const expand = screen.getByRole('button', { name: /habits & metrics/i });
    fireEvent.click(expand);
    expect(screen.getByRole('button', { name: /hide habits & metrics/i })).toBeInTheDocument();
    expect(screen.getByText('Habits to Complete')).toBeInTheDocument();
  });

  it('uses a single-line briefing with counts when tasks exist', async () => {
    vi.mocked(selectTop3TasksForToday).mockReturnValue([
      makeTask('top-1', 'Task one'),
      makeTask('top-2', 'Task two', 'P2'),
    ]);

    await renderAssistant();

    expect(screen.getByText(/2 focus tasks · 0 habits · 0 metrics/)).toBeInTheDocument();
  });
});
