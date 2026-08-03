import { MarkerType, type Edge } from '@xyflow/react';
import type { Priority, Project, ProjectDependency, ProjectStatus } from '@/types/growth-system';
import { getProjectStatusBadgeColors } from '@/lib/growth-system/project-status-surfaces';

export const PROJECT_GRAPH_NODE_WIDTH = 220;
export const PROJECT_GRAPH_NODE_HEIGHT = 72;

const PRIORITY_SURFACE: Record<Priority, { surface: string; accent: string; minimap: string }> = {
  P1: {
    surface:
      'bg-red-50 border-red-200 text-red-950 dark:bg-red-950/35 dark:border-red-800 dark:text-red-50',
    accent: 'bg-red-500',
    minimap: '#ef4444',
  },
  P2: {
    surface:
      'bg-orange-50 border-orange-200 text-orange-950 dark:bg-orange-950/35 dark:border-orange-800 dark:text-orange-50',
    accent: 'bg-orange-500',
    minimap: '#f97316',
  },
  P3: {
    surface:
      'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/35 dark:border-amber-800 dark:text-amber-50',
    accent: 'bg-amber-500',
    minimap: '#eab308',
  },
  P4: {
    surface:
      'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-100',
    accent: 'bg-slate-400',
    minimap: '#94a3b8',
  },
};

const COMPLETED_SURFACE =
  'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100';

const COMPLETED_MINIMAP = '#6ee7b7';

const DEFAULT_PRIORITY: Priority = 'P3';

export function projectNodeSurfaceClass(project: Project): string {
  if (project.status === 'Completed') {
    return COMPLETED_SURFACE;
  }
  const priority = project.priority in PRIORITY_SURFACE ? project.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].surface;
}

export function projectNodeAccentClass(project: Project): string {
  if (project.status === 'Completed') {
    return 'bg-emerald-400';
  }
  const priority = project.priority in PRIORITY_SURFACE ? project.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].accent;
}

export function projectMinimapNodeColor(project: Project): string {
  if (project.status === 'Completed') {
    return COMPLETED_MINIMAP;
  }
  const priority = project.priority in PRIORITY_SURFACE ? project.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].minimap;
}

export function projectStatusChipClass(status: ProjectStatus): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200';
    case 'Active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
    case 'Planning':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200';
    case 'On Hold':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
    case 'Archived':
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

/** Chip classes for resolved display status (includes Stale from `resolveProjectBadgeStatus`). */
export function projectDisplayStatusChipClass(badgeStatus: string): string {
  const core = getProjectStatusBadgeColors(badgeStatus);
  if (core) {
    return `${core.bg} ${core.text}`;
  }
  return projectStatusChipClass(badgeStatus as ProjectStatus);
}

export function computeProjectGraphStructureKey(
  projects: Project[],
  dependencies: ProjectDependency[]
): string {
  const projectIds = [...projects.map((p) => p.id)].sort().join(',');
  const depPairs = [
    ...dependencies.map((d) => `${d.predecessorProjectId}->${d.successorProjectId}`),
  ]
    .sort()
    .join(',');
  return `${projectIds}|${depPairs}`;
}

export function buildProjectDependencyEdges(
  projects: Project[],
  dependencies: ProjectDependency[],
  selectedNodeId: string | null,
  reduceMotion: boolean
): Edge[] {
  const projectIds = new Set(projects.map((p) => p.id));

  return dependencies
    .filter(
      (dep) => projectIds.has(dep.successorProjectId) && projectIds.has(dep.predecessorProjectId)
    )
    .map((dep) => {
      const highlighted =
        selectedNodeId === dep.successorProjectId || selectedNodeId === dep.predecessorProjectId;
      return {
        id: `dep-${dep.predecessorProjectId}-${dep.successorProjectId}`,
        source: dep.predecessorProjectId,
        target: dep.successorProjectId,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
        },
        animated: highlighted && !reduceMotion,
        style: highlighted
          ? { stroke: '#3b82f6', strokeWidth: 1.75 }
          : { stroke: '#a1a1aa', strokeWidth: 1.25 },
      };
    });
}

export function stubProjectForGraph(id: string): Project {
  return {
    id,
    name: 'Unknown project',
    description: null,
    area: 'Operations',
    subCategory: null,
    priority: 'P3',
    status: 'Planning',
    impact: 0,
    startDate: null,
    targetEndDate: null,
    actualEndDate: null,
    notes: null,
    userId: '',
    createdAt: '',
    updatedAt: '',
  };
}

export function buildProjectNeighborhood({
  focusProject,
  predecessors,
  successors,
  projectsById,
}: {
  focusProject: Project;
  predecessors: ProjectDependency[];
  successors: ProjectDependency[];
  projectsById: Map<string, Project>;
}): { projects: Project[]; dependencies: ProjectDependency[] } {
  const focusId = focusProject.id;
  const dependencies = [...predecessors, ...successors];
  const neighborIds = new Set<string>();

  for (const dep of predecessors) {
    neighborIds.add(dep.predecessorProjectId);
  }
  for (const dep of successors) {
    neighborIds.add(dep.successorProjectId);
  }

  const projects: Project[] = [focusProject];
  for (const id of neighborIds) {
    if (id === focusId) continue;
    projects.push(projectsById.get(id) ?? stubProjectForGraph(id));
  }

  return { projects, dependencies };
}

/** Edge between focus and a selected neighbor, if any. */
export function findFocusNeighborDependency(
  focusId: string,
  neighborId: string,
  dependencies: ProjectDependency[]
): ProjectDependency | null {
  return (
    dependencies.find(
      (dep) =>
        (dep.predecessorProjectId === neighborId && dep.successorProjectId === focusId) ||
        (dep.predecessorProjectId === focusId && dep.successorProjectId === neighborId)
    ) ?? null
  );
}
