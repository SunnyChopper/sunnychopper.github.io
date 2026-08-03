import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TaskCalendarView } from '@/components/organisms/TaskCalendarView';
import type { Task } from '@/types/growth-system';

function makeTask(id: string, title: string, dueDate: string): Task {
  return {
    id,
    title,
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Backlog',
    size: null,
    dueDate,
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

const may2026 = new Date('2026-05-01T12:00:00.000Z');

describe('TaskCalendarView overflow popover', () => {
  it('opens a popover with all tasks when +more is clicked', async () => {
    const onTaskClick = vi.fn();
    const dueDate = '2026-05-15';
    const tasks = [
      makeTask('1', 'Task One', dueDate),
      makeTask('2', 'Task Two', dueDate),
      makeTask('3', 'Task Three', dueDate),
      makeTask('4', 'Task Four', dueDate),
    ];

    render(
      <TaskCalendarView
        tasks={tasks}
        onTaskClick={onTaskClick}
        isLoading={false}
        initialMonth={may2026}
      />
    );

    const moreButton = screen.getByRole('button', { name: /Show 2 more tasks on/i });
    await userEvent.click(moreButton);

    const dialog = screen.getByRole('dialog', { name: /Tasks on/i });
    expect(within(dialog).getByText('Task One')).toBeInTheDocument();
    expect(within(dialog).getByText('Task Four')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Task Three' }));
    expect(onTaskClick).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }));
  });

  it('closes the popover when the backdrop is clicked', async () => {
    const dueDate = '2026-05-20';
    const tasks = [
      makeTask('1', 'Alpha', dueDate),
      makeTask('2', 'Beta', dueDate),
      makeTask('3', 'Gamma', dueDate),
    ];

    render(<TaskCalendarView tasks={tasks} onTaskClick={vi.fn()} initialMonth={may2026} />);

    await userEvent.click(screen.getByRole('button', { name: /Show 1 more tasks on/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('calendar-overflow-backdrop'));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});

describe('TaskCalendarView month polish', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows visible-month task count only in the summary', () => {
    const tasks = [
      makeTask('1', 'May task A', '2026-05-10'),
      makeTask('2', 'May task B', '2026-05-20'),
      makeTask('3', 'June task', '2026-06-01'),
    ];

    render(<TaskCalendarView tasks={tasks} onTaskClick={vi.fn()} initialMonth={may2026} />);

    expect(screen.getByText('2 tasks scheduled')).toBeInTheDocument();
  });

  it('uses singular copy when one task is scheduled in the visible month', () => {
    const tasks = [makeTask('1', 'Only May', '2026-05-12')];

    render(<TaskCalendarView tasks={tasks} onTaskClick={vi.fn()} initialMonth={may2026} />);

    expect(screen.getByText('1 task scheduled')).toBeInTheDocument();
  });

  it('exposes accessible labels on month navigation controls', () => {
    render(<TaskCalendarView tasks={[]} onTaskClick={vi.fn()} initialMonth={may2026} />);

    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
  });

  it('changes the visible month when next and previous are clicked', async () => {
    render(<TaskCalendarView tasks={[]} onTaskClick={vi.fn()} initialMonth={may2026} />);

    expect(screen.getByRole('heading', { name: /May 2026/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(await screen.findByRole('heading', { name: /June 2026/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(await screen.findByRole('heading', { name: /May 2026/i })).toBeInTheDocument();
  });

  it('Today button is present and marks the current month when viewing it', () => {
    vi.setSystemTime(new Date('2026-05-15T12:00:00.000Z'));
    vi.useFakeTimers();

    render(<TaskCalendarView tasks={[]} onTaskClick={vi.fn()} initialMonth={may2026} />);

    const todayButton = screen.getByRole('button', { name: 'Today' });
    expect(todayButton).toHaveAttribute('aria-current', 'date');
  });

  it('renders task chips with full title on aria-label and title attributes', () => {
    const longTitle =
      'This is an intentionally very long task title that should truncate inside the calendar cell without overflowing';
    const tasks = [makeTask('1', longTitle, '2026-05-08')];

    render(<TaskCalendarView tasks={tasks} onTaskClick={vi.fn()} initialMonth={may2026} />);

    const chip = screen.getByRole('button', { name: longTitle });
    expect(chip).toHaveAttribute('title', longTitle);
  });
});
