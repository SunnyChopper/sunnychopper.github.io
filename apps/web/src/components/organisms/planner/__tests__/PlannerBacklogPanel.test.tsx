import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlannerBacklogPanel } from '../PlannerBacklogPanel';
import type { Task } from '@/types/growth-system';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P2',
    status: 'Not Started',
    size: 3,
    dueDate: null,
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
    ...overrides,
  };
}

describe('PlannerBacklogPanel', () => {
  it('truncates backlog row titles on a single line with native tooltip', () => {
    const longTitle =
      'Platform migration phase two infrastructure rollout with extended stakeholder alignment';
    const task = makeTask({ id: 'task-1', title: longTitle, priority: 'P1' });

    const { container } = render(
      <PlannerBacklogPanel tasks={[task]} scheduledTaskIds={new Set()} />
    );

    const titleRow = screen.getByLabelText(longTitle);
    expect(titleRow).toHaveClass('truncate');
    expect(titleRow).not.toHaveClass('line-clamp-2');
    expect(titleRow).toHaveAttribute('title', longTitle);
    expect(titleRow).toHaveAccessibleName(longTitle);
    expect(screen.getByText('P1')).toHaveAttribute('aria-label', 'Priority P1: Critical/Urgent');

    const listItem = container.querySelector('li');
    expect(listItem).toHaveClass('min-w-0');
    expect(listItem).not.toHaveClass('truncate');
  });

  it('excludes scheduled and terminal-status tasks from backlog', () => {
    const visible = makeTask({ id: 'visible', title: 'Unscheduled task' });
    const scheduled = makeTask({ id: 'scheduled', title: 'Already scheduled' });
    const done = makeTask({ id: 'done', title: 'Done task', status: 'Done' });

    render(
      <PlannerBacklogPanel
        tasks={[visible, scheduled, done]}
        scheduledTaskIds={new Set(['scheduled'])}
      />
    );

    expect(screen.getByLabelText('Unscheduled task')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Already scheduled/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Done task/)).not.toBeInTheDocument();
  });
});
