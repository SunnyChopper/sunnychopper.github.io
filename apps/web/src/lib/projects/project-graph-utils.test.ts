import { describe, expect, it } from 'vitest';
import type { Project, ProjectDependency } from '@/types/growth-system';
import {
  buildProjectDependencyEdges,
  buildProjectNeighborhood,
  computeProjectGraphStructureKey,
  findFocusNeighborDependency,
  projectDisplayStatusChipClass,
  projectNodeSurfaceClass,
} from '@/lib/projects/project-graph-utils';

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

describe('buildProjectNeighborhood', () => {
  const focus = makeProject({ id: 'focus', name: 'Focus Project' });
  const pred = makeProject({ id: 'pred', name: 'Predecessor' });
  const succ = makeProject({ id: 'succ', name: 'Successor' });

  const predecessors: ProjectDependency[] = [
    {
      predecessorProjectId: 'pred',
      successorProjectId: 'focus',
      lagDays: 0,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];
  const successors: ProjectDependency[] = [
    {
      predecessorProjectId: 'focus',
      successorProjectId: 'succ',
      lagDays: 2,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  it('includes focus and direct neighbors', () => {
    const projectsById = new Map([
      [focus.id, focus],
      [pred.id, pred],
      [succ.id, succ],
    ]);

    const result = buildProjectNeighborhood({
      focusProject: focus,
      predecessors,
      successors,
      projectsById,
    });

    expect(result.projects.map((p) => p.id).sort()).toEqual(['focus', 'pred', 'succ']);
    expect(result.dependencies).toHaveLength(2);
  });

  it('stubs missing neighbor projects', () => {
    const result = buildProjectNeighborhood({
      focusProject: focus,
      predecessors,
      successors: [],
      projectsById: new Map([[focus.id, focus]]),
    });

    const stub = result.projects.find((p) => p.id === 'pred');
    expect(stub?.name).toBe('Unknown project');
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

  it('maps predecessor to successor as source to target', () => {
    const edges = buildProjectDependencyEdges(projects, dependencies, null, true);
    expect(edges[0]?.source).toBe('p1');
    expect(edges[0]?.target).toBe('p2');
  });

  it('highlights edges when selected node matches', () => {
    const edges = buildProjectDependencyEdges(projects, dependencies, 'p2', false);
    expect(edges[0]?.animated).toBe(true);
  });
});

describe('computeProjectGraphStructureKey', () => {
  it('is stable regardless of input order', () => {
    const projects = [makeProject({ id: 'b', name: 'B' }), makeProject({ id: 'a', name: 'A' })];
    const depsA: ProjectDependency[] = [
      {
        predecessorProjectId: 'a',
        successorProjectId: 'b',
        lagDays: 0,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    const depsB: ProjectDependency[] = [...depsA];

    expect(computeProjectGraphStructureKey(projects, depsA)).toBe(
      computeProjectGraphStructureKey([projects[1], projects[0]], depsB)
    );
  });
});

describe('findFocusNeighborDependency', () => {
  const dependencies: ProjectDependency[] = [
    {
      predecessorProjectId: 'pred',
      successorProjectId: 'focus',
      lagDays: 1,
      createdAt: '2026-01-01T00:00:00Z',
    },
  ];

  it('finds predecessor edge', () => {
    const edge = findFocusNeighborDependency('focus', 'pred', dependencies);
    expect(edge?.lagDays).toBe(1);
  });

  it('returns null when no edge exists', () => {
    expect(findFocusNeighborDependency('focus', 'other', dependencies)).toBeNull();
  });
});

describe('projectNodeSurfaceClass', () => {
  it('uses calm green for Completed projects', () => {
    const project = makeProject({ id: 'p1', name: 'Done', status: 'Completed' });
    expect(projectNodeSurfaceClass(project)).toContain('emerald');
  });
});

describe('projectDisplayStatusChipClass', () => {
  it('uses rose tokens for Stale display status', () => {
    expect(projectDisplayStatusChipClass('Stale')).toContain('rose');
  });
});
