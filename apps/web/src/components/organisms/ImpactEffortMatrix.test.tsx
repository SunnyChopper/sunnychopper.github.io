import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Project, Task } from '@/types/growth-system';
import { ImpactEffortMatrix } from '@/components/organisms/ImpactEffortMatrix';

function makeProject(overrides: Partial<Project> & Pick<Project, 'id' | 'name'>): Project {
  return {
    description: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Active',
    impact: 3,
    startDate: null,
    targetEndDate: null,
    actualEndDate: null,
    notes: null,
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Backlog',
    size: null,
    dueDate: null,
    scheduledDate: null,
    completedDate: null,
    notes: null,
    isRecurring: false,
    recurrenceRule: null,
    pointValue: null,
    pointsAwarded: null,
    projectIds: ['kill'],
    goalIds: [],
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ImpactEffortMatrix', () => {
  const projects = [
    makeProject({ id: 'kill', name: 'Kill Candidate', impact: 2, priority: 'P4' }),
    makeProject({ id: 'win', name: 'Quick Win', impact: 5, priority: 'P1' }),
    makeProject({ id: 'unscored', name: 'Needs Impact', impact: 0 }),
  ];

  const tasks = [
    makeTask({ id: 't1', title: 'Heavy', projectIds: ['kill'], size: 13 }),
    makeTask({ id: 't2', title: 'Light', projectIds: ['win'], size: 1 }),
    makeTask({ id: 't3', title: 'Other', projectIds: ['unscored'], size: 5 }),
  ];

  it('renders matrix heading, quadrants, and kill zone project', () => {
    render(<ImpactEffortMatrix projects={projects} tasks={tasks} onSelectProject={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Impact vs Effort Matrix/i })).toBeInTheDocument();
    expect(screen.getByText('Kill / de-scope')).toBeInTheDocument();
    expect(screen.getByText('Quick wins')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kill Candidate/i })).toBeInTheDocument();
    expect(screen.getByText(/Unscored impact \(1\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Needs Impact/i })).toBeInTheDocument();
  });

  it('calls onSelectProject when a list item is clicked', async () => {
    const user = userEvent.setup();
    const onSelectProject = vi.fn();

    render(
      <ImpactEffortMatrix projects={projects} tasks={tasks} onSelectProject={onSelectProject} />
    );

    await user.click(screen.getByRole('button', { name: /Quick Win/i }));
    expect(onSelectProject).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'win', name: 'Quick Win' })
    );
  });

  it('shows empty state when no projects are provided', () => {
    render(<ImpactEffortMatrix projects={[]} tasks={[]} onSelectProject={vi.fn()} />);
    expect(screen.getByText(/No incomplete projects match your filters/i)).toBeInTheDocument();
  });
});
