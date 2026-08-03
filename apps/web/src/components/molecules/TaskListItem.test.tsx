import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskListItem, TASK_LIST_ITEM_DENSE_GRID } from '@/components/molecules/TaskListItem';
import type { Task } from '@/types/growth-system';

const baseTask: Task = {
  id: 'task-1',
  title: 'Ship list density polish',
  description: null,
  extendedDescription: null,
  area: 'Operations',
  subCategory: null,
  priority: 'P2',
  status: 'In Progress',
  size: 3,
  dueDate: '2026-07-30',
  scheduledDate: null,
  completedDate: null,
  notes: null,
  isRecurring: false,
  recurrenceRule: null,
  pointValue: 5,
  pointsAwarded: false,
  projectIds: [],
  goalIds: [],
  userId: 'user-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
};

describe('TaskListItem', () => {
  it('renders title, area, and action buttons', () => {
    render(
      <TaskListItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onComplete={vi.fn()} />
    );

    expect(screen.getAllByText('Ship list density polish').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operations').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Mark done/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Edit task/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /Delete task/i }).length).toBeGreaterThan(0);
  });

  it('calls onComplete when Done is clicked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <TaskListItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onComplete={onComplete} />
    );

    await user.click(screen.getAllByRole('button', { name: /Mark done/i })[0]!);

    expect(onComplete).toHaveBeenCalledWith(baseTask);
  });

  it('hides Done when task is already complete', () => {
    render(
      <TaskListItem
        task={{ ...baseTask, status: 'Done' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Mark done/i })).not.toBeInTheDocument();
  });

  it('applies hover-reveal classes to dense-layout actions when actionsVisibility is hover', () => {
    render(
      <TaskListItem
        task={baseTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onComplete={vi.fn()}
        actionsVisibility="hover"
      />
    );

    const actionGroups = screen.getAllByRole('group', { name: 'Task actions' });
    const denseGroup = actionGroups.find((el) =>
      el.className.includes('@[36rem]:group-hover:opacity-100')
    );
    expect(denseGroup).toBeTruthy();
    expect(denseGroup?.className).toContain('@[36rem]:opacity-0');
  });

  it('uses container-query dense grid with a minimum title track width', () => {
    expect(TASK_LIST_ITEM_DENSE_GRID).toContain('@[36rem]:grid');
    expect(TASK_LIST_ITEM_DENSE_GRID).toContain('minmax(8rem,1fr)');

    render(
      <TaskListItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onComplete={vi.fn()} />
    );

    const denseLayout = screen.getByTestId('task-list-item-dense-layout');
    expect(denseLayout.className).toContain('@[36rem]:grid');
    expect(denseLayout.className).toContain('minmax(8rem,1fr)');
    expect(screen.getByTestId('task-list-item-stacked-layout').className).toContain(
      '@[36rem]:hidden'
    );
  });

  it('gives the title flex-1 so chips cannot collapse it in dense layout', () => {
    render(
      <TaskListItem
        task={{ ...baseTask, subtaskCount: 4, completedSubtaskCount: 2 }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const titles = screen.getAllByText('Ship list density polish');
    expect(titles.some((el) => el.classList.contains('flex-1'))).toBe(true);
  });

  it('shows full-opacity dense-layout actions when actionsVisibility is always', () => {
    render(
      <TaskListItem
        task={baseTask}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onComplete={vi.fn()}
        actionsVisibility="always"
      />
    );

    const actionGroups = screen.getAllByRole('group', { name: 'Task actions' });
    const denseGroup = actionGroups.find((el) => el.className.includes('@[36rem]:opacity-0'));
    expect(denseGroup).toBeUndefined();
  });

  it('styles completed task title with line-through', () => {
    render(
      <TaskListItem task={{ ...baseTask, status: 'Done' }} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    const titles = screen.getAllByText('Ship list density polish');
    expect(titles.some((el) => el.classList.contains('line-through'))).toBe(true);
  });

  it('shows subtask progress chip when subtaskCount is set', () => {
    render(
      <TaskListItem
        task={{ ...baseTask, subtaskCount: 4, completedSubtaskCount: 2 }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getAllByText('2/4').length).toBeGreaterThan(0);
  });

  it('opens details on Enter when onClick is provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<TaskListItem task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} onClick={onClick} />);

    const row = screen.getByRole('button', { name: /View task details/i });
    row.focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledWith(baseTask);
  });
});
