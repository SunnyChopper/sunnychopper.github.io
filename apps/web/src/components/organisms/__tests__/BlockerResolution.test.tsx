import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BlockerResolution } from '@/components/organisms/BlockerResolution';
import type { Task } from '@/types/growth-system';

function makeTask(id: string, title: string): Task {
  return {
    id,
    title,
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P1',
    status: 'Blocked',
    size: 5,
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
  };
}

describe('BlockerResolution', () => {
  it('renders affirmative empty state when no blocked tasks', () => {
    render(<BlockerResolution tasks={[]} resolutions={[]} onChange={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'No open blockers — clear path for the week.'
    );
    expect(screen.queryByText(/No blocked tasks right now/i)).not.toBeInTheDocument();
  });

  it('renders blocked task title and next-action field when tasks exist', () => {
    render(
      <BlockerResolution
        tasks={[makeTask('t1', 'Fix reliability issues')]}
        resolutions={[]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Fix reliability issues')).toBeInTheDocument();
    expect(screen.getByText(/Immediate next physical action to unblock/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/No open blockers — clear path for the week/i)
    ).not.toBeInTheDocument();
  });
});
