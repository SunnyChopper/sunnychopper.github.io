import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Task, TaskDependency } from '@/types/growth-system';
import DependencyGraph from '@/components/organisms/DependencyGraph';
import { buildDependencyEdges } from '@/lib/task-graph-utils';

vi.mock('@xyflow/react', () => {
  const ReactFlow = ({
    children,
    nodes,
  }: {
    children?: React.ReactNode;
    nodes?: { id: string }[];
  }) => (
    <div data-testid="react-flow" data-node-count={nodes?.length ?? 0}>
      {children}
    </div>
  );

  return {
    Background: () => null,
    MarkerType: { ArrowClosed: 'arrowclosed' },
    MiniMap: () => null,
    Panel: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    ReactFlow,
    ReactFlowProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    useEdgesState: (initial: unknown[]) => {
      const state = { current: initial };
      return [state.current, vi.fn(), vi.fn()] as const;
    },
    useNodesState: (initial: unknown[]) => {
      const state = { current: initial };
      return [state.current, vi.fn(), vi.fn()] as const;
    },
    useReactFlow: () => ({
      fitView: vi.fn(),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
    }),
  };
});

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

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

describe('DependencyGraph', () => {
  it('renders EmptyState when there are no tasks', () => {
    render(<DependencyGraph tasks={[]} dependencies={[]} />);
    expect(screen.getByRole('heading', { name: 'No tasks to map' })).toBeInTheDocument();
  });

  it('renders canvas for orphan tasks without dependency edges', () => {
    const tasks = [makeTask({ id: 't1', title: 'Alpha' }), makeTask({ id: 't2', title: 'Beta' })];

    render(<DependencyGraph tasks={tasks} dependencies={[]} />);

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-node-count', '2');
    expect(
      screen.getByText('No dependency links yet — tasks shown as standalone nodes')
    ).toBeInTheDocument();
  });

  it('renders canvas when dependencies exist', () => {
    const tasks = [makeTask({ id: 't1', title: 'First' }), makeTask({ id: 't2', title: 'Second' })];
    const dependencies: TaskDependency[] = [
      { id: 'dep-1', taskId: 't2', dependsOnTaskId: 't1', createdAt: '2026-01-01T00:00:00Z' },
    ];

    render(<DependencyGraph tasks={tasks} dependencies={dependencies} />);

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(
      screen.queryByText('No dependency links yet — tasks shown as standalone nodes')
    ).not.toBeInTheDocument();
  });
});

describe('buildDependencyEdges', () => {
  const tasks = [makeTask({ id: 't1', title: 'First' }), makeTask({ id: 't2', title: 'Second' })];
  const dependencies: TaskDependency[] = [
    { id: 'dep-1', taskId: 't2', dependsOnTaskId: 't1', createdAt: '2026-01-01T00:00:00Z' },
  ];

  it('does not animate edges when reduced motion is enabled', () => {
    const edges = buildDependencyEdges(tasks, dependencies, 't2', true);
    expect(edges[0]?.animated).toBe(false);
  });

  it('animates highlighted edges when reduced motion is disabled', () => {
    const edges = buildDependencyEdges(tasks, dependencies, 't2', false);
    expect(edges[0]?.animated).toBe(true);
  });

  it('uses thin default stroke width', () => {
    const edges = buildDependencyEdges(tasks, dependencies, null, true);
    expect(edges[0]?.style?.strokeWidth).toBe(1.25);
  });
});
