import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Project, ProjectDependency } from '@/types/growth-system';
import ProjectDependencyMiniGraph from '@/components/organisms/ProjectDependencyMiniGraph';
import { buildProjectDependencyEdges } from '@/lib/projects/project-graph-utils';

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

describe('ProjectDependencyMiniGraph', () => {
  const focus = makeProject({ id: 'focus', name: 'Focus Project' });

  it('renders EmptyState when there are no projects', () => {
    render(<ProjectDependencyMiniGraph focusProject={focus} projects={[]} dependencies={[]} />);
    expect(screen.getByRole('heading', { name: 'No project to map' })).toBeInTheDocument();
  });

  it('renders solo focus node without dependency edges', () => {
    render(
      <ProjectDependencyMiniGraph focusProject={focus} projects={[focus]} dependencies={[]} />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow')).toHaveAttribute('data-node-count', '1');
    expect(
      screen.getByText('No finish-to-start links yet — draw a connector on the Timeline')
    ).toBeInTheDocument();
  });

  it('renders canvas when dependencies exist', () => {
    const pred = makeProject({ id: 'pred', name: 'Predecessor' });
    const dependencies: ProjectDependency[] = [
      {
        predecessorProjectId: 'pred',
        successorProjectId: 'focus',
        lagDays: 0,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    render(
      <ProjectDependencyMiniGraph
        focusProject={focus}
        projects={[focus, pred]}
        dependencies={dependencies}
      />
    );

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(
      screen.queryByText('No finish-to-start links yet — draw a connector on the Timeline')
    ).not.toBeInTheDocument();
  });
});

describe('buildProjectDependencyEdges', () => {
  const projects = [
    makeProject({ id: 'p1', name: 'First' }),
    makeProject({ id: 'p2', name: 'Second' }),
  ];
  const dependencies: ProjectDependency[] = [
    {
      predecessorProjectId: 'p1',
      successorProjectId: 'p2',
      lagDays: 0,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  it('does not animate edges when reduced motion is enabled', () => {
    const edges = buildProjectDependencyEdges(projects, dependencies, 'p2', true);
    expect(edges[0]?.animated).toBe(false);
  });

  it('animates highlighted edges when reduced motion is disabled', () => {
    const edges = buildProjectDependencyEdges(projects, dependencies, 'p2', false);
    expect(edges[0]?.animated).toBe(true);
  });
});
