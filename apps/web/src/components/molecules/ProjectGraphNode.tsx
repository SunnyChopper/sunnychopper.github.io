import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { Project } from '@/types/growth-system';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import {
  projectNodeAccentClass,
  projectNodeSurfaceClass,
  projectDisplayStatusChipClass,
  PROJECT_GRAPH_NODE_HEIGHT,
  PROJECT_GRAPH_NODE_WIDTH,
} from '@/lib/projects/project-graph-utils';
import { resolveProjectBadgeStatus } from '@/utils/project-summary';
import { cn } from '@/lib/utils';

export { PROJECT_GRAPH_NODE_HEIGHT, PROJECT_GRAPH_NODE_WIDTH };

export type ProjectGraphNodeData = {
  project: Project;
  isFocus?: boolean;
};

export type ProjectGraphRfNode = Node<ProjectGraphNodeData, 'projectGraph'>;

export function ProjectGraphNode({ data, selected }: NodeProps<ProjectGraphRfNode>) {
  const { project, isFocus = false } = data;
  const badgeStatus = resolveProjectBadgeStatus(project);

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-lg border shadow-sm transition-shadow',
        'cursor-grab active:cursor-grabbing hover:shadow-md',
        projectNodeSurfaceClass(project),
        isFocus && 'ring-2 ring-blue-400/80 dark:ring-blue-500/70',
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
      )}
      style={{ width: PROJECT_GRAPH_NODE_WIDTH, height: PROJECT_GRAPH_NODE_HEIGHT }}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1 rounded-l-lg',
          projectNodeAccentClass(project)
        )}
        aria-hidden
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-transparent !opacity-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2 pl-3.5">
        {isFocus ? (
          <span className="pointer-events-none mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            This project
          </span>
        ) : null}
        <p
          className="pointer-events-none line-clamp-2 text-left text-sm font-semibold leading-snug"
          title={project.name}
        >
          {project.name}
        </p>
        <div className="pointer-events-none mt-1.5 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex max-w-[7.5rem] truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-none',
              projectDisplayStatusChipClass(badgeStatus)
            )}
          >
            {badgeStatus}
          </span>
          <PriorityIndicator priority={project.priority} variant="dot" size="sm" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-transparent !opacity-0"
      />
    </div>
  );
}
