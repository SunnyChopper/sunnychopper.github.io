import { MarkerType, type Edge } from '@xyflow/react';
import type { Priority, Task, TaskDependency, TaskStatus } from '@/types/growth-system';

export const TASK_GRAPH_NODE_WIDTH = 220;
export const TASK_GRAPH_NODE_HEIGHT = 72;

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

const DONE_SURFACE =
  'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-100';

const DONE_MINIMAP = '#6ee7b7';

const DEFAULT_PRIORITY: Priority = 'P3';

export function nodeSurfaceClass(task: Task): string {
  if (task.status === 'Done') {
    return DONE_SURFACE;
  }
  const priority = task.priority in PRIORITY_SURFACE ? task.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].surface;
}

export function nodeAccentClass(task: Task): string {
  if (task.status === 'Done') {
    return 'bg-emerald-400';
  }
  const priority = task.priority in PRIORITY_SURFACE ? task.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].accent;
}

export function minimapNodeColor(task: Task): string {
  if (task.status === 'Done') {
    return DONE_MINIMAP;
  }
  const priority = task.priority in PRIORITY_SURFACE ? task.priority : DEFAULT_PRIORITY;
  return PRIORITY_SURFACE[priority].minimap;
}

export function statusChipClass(status: TaskStatus): string {
  switch (status) {
    case 'Done':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200';
    case 'Blocked':
      return 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
    case 'On Hold':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200';
    case 'Backlog':
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    case 'Not Started':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

export function computeGraphStructureKey(tasks: Task[], dependencies: TaskDependency[]): string {
  const taskIds = [...tasks.map((t) => t.id)].sort().join(',');
  const depPairs = [...dependencies.map((d) => `${d.dependsOnTaskId}->${d.taskId}`)]
    .sort()
    .join(',');
  return `${taskIds}|${depPairs}`;
}

export function buildDependencyEdges(
  tasks: Task[],
  dependencies: TaskDependency[],
  selectedNodeId: string | null,
  reduceMotion: boolean
): Edge[] {
  const taskIds = new Set(tasks.map((t) => t.id));

  return dependencies
    .filter((dep) => taskIds.has(dep.taskId) && taskIds.has(dep.dependsOnTaskId))
    .map((dep) => {
      const highlighted = selectedNodeId === dep.taskId || selectedNodeId === dep.dependsOnTaskId;
      return {
        id: `dep-${dep.dependsOnTaskId}-${dep.taskId}`,
        source: dep.dependsOnTaskId,
        target: dep.taskId,
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
