import { render, screen } from '@testing-library/react';
import { ReactFlowProvider, type NodeProps } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import type { Project } from '@/types/growth-system';
import { ProjectGraphNode, type ProjectGraphRfNode } from '@/components/molecules/ProjectGraphNode';
import { projectNodeSurfaceClass } from '@/lib/projects/project-graph-utils';

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

function renderNode(project: Project, isFocus = false, selected = false) {
  const props = {
    id: project.id,
    type: 'projectGraph' as const,
    data: { project, isFocus },
    selected,
    zIndex: 0,
    isConnectable: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
    selectable: true,
    deletable: false,
    draggable: true,
  } satisfies Partial<NodeProps<ProjectGraphRfNode>>;

  return render(
    <ReactFlowProvider>
      <ProjectGraphNode {...(props as NodeProps<ProjectGraphRfNode>)} />
    </ReactFlowProvider>
  );
}

describe('ProjectGraphNode', () => {
  it('uses calm green surface for Completed projects', () => {
    const project = makeProject({ id: 'p1', name: 'Shipped', status: 'Completed' });
    expect(projectNodeSurfaceClass(project)).toContain('emerald');

    const { container } = renderNode(project);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('uses priority-tinted surface for active projects', () => {
    const p1 = makeProject({ id: 'p1', name: 'Urgent', priority: 'P1', status: 'Active' });
    expect(projectNodeSurfaceClass(p1)).toContain('red');
  });

  it('renders full name with line-clamp', () => {
    const longName = 'Platform migration phase two infrastructure rollout';
    const project = makeProject({ id: 'p1', name: longName });

    renderNode(project);

    expect(screen.getByText(longName)).toBeInTheDocument();
    expect(screen.getByText(longName)).toHaveClass('line-clamp-2');
    expect(screen.getByText(longName)).toHaveAttribute('title', longName);
  });

  it('shows focus label when isFocus is true', () => {
    const project = makeProject({ id: 'p1', name: 'Focus' });
    renderNode(project, true);
    expect(screen.getByText('This project')).toBeInTheDocument();
  });

  it('shows status chip', () => {
    const project = makeProject({ id: 'p1', name: 'On hold', status: 'On Hold' });
    renderNode(project);
    expect(screen.getByText('On Hold')).toBeInTheDocument();
  });
});
