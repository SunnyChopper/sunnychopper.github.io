import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import type { Task } from '@/types/growth-system';
import { TaskGraphNode, type TaskGraphRfNode } from '@/components/molecules/TaskGraphNode';
import { nodeSurfaceClass } from '@/lib/task-graph-utils';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    description: null,
    extendedDescription: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
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

function renderNode(task: Task, selected = false) {
  const props = {
    id: task.id,
    type: 'taskGraph' as const,
    data: { task },
    selected,
    zIndex: 0,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
    selectable: true,
    deletable: false,
    draggable: true,
  } satisfies Partial<NodeProps<TaskGraphRfNode>>;

  return render(
    <ReactFlowProvider>
      <TaskGraphNode {...(props as NodeProps<TaskGraphRfNode>)} />
    </ReactFlowProvider>
  );
}

describe('TaskGraphNode', () => {
  it('uses calm green surface for Done tasks', () => {
    const task = makeTask({ id: 't1', title: 'Ship feature', status: 'Done' });
    expect(nodeSurfaceClass(task)).toContain('emerald');

    const { container } = renderNode(task);

    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('uses priority-tinted surface for active tasks', () => {
    const p1 = makeTask({ id: 't1', title: 'Urgent', priority: 'P1', status: 'In Progress' });
    const p2 = makeTask({ id: 't2', title: 'Important', priority: 'P2', status: 'Not Started' });

    expect(nodeSurfaceClass(p1)).toContain('red');
    expect(nodeSurfaceClass(p2)).toContain('orange');
  });

  it('renders full title with line-clamp (not hard 20-char truncation)', () => {
    const longTitle = 'Prepare quarterly planning retrospective deck with stakeholder notes';
    const task = makeTask({ id: 't1', title: longTitle, priority: 'P1' });

    renderNode(task);

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longTitle)).toHaveClass('line-clamp-2');
    expect(screen.getByText(longTitle)).toHaveAttribute('title', longTitle);
  });

  it('shows status chip', () => {
    const task = makeTask({ id: 't1', title: 'Blocked task', status: 'Blocked' });

    renderNode(task);

    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });
});
