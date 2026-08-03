import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { Task } from '@/types/growth-system';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import {
  nodeAccentClass,
  nodeSurfaceClass,
  statusChipClass,
  TASK_GRAPH_NODE_HEIGHT,
  TASK_GRAPH_NODE_WIDTH,
} from '@/lib/task-graph-utils';
import { cn } from '@/lib/utils';

export { TASK_GRAPH_NODE_HEIGHT, TASK_GRAPH_NODE_WIDTH };

export type TaskGraphNodeData = {
  task: Task;
};

export type TaskGraphRfNode = Node<TaskGraphNodeData, 'taskGraph'>;

export function TaskGraphNode({ data, selected }: NodeProps<TaskGraphRfNode>) {
  const { task } = data;
  const isBlocked = task.status === 'Blocked';

  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-lg border shadow-sm transition-shadow',
        'cursor-grab active:cursor-grabbing hover:shadow-md',
        nodeSurfaceClass(task),
        isBlocked && 'ring-1 ring-red-400/70 dark:ring-red-500/60',
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
      )}
      style={{ width: TASK_GRAPH_NODE_WIDTH, height: TASK_GRAPH_NODE_HEIGHT }}
    >
      <span
        className={cn('absolute inset-y-0 left-0 w-1 rounded-l-lg', nodeAccentClass(task))}
        aria-hidden
      />
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-transparent !opacity-0"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2 pl-3.5">
        <p
          className="pointer-events-none line-clamp-2 text-left text-sm font-semibold leading-snug"
          title={task.title}
        >
          {task.title}
        </p>
        <div className="pointer-events-none mt-1.5 flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex max-w-[7.5rem] truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-none',
              statusChipClass(task.status)
            )}
          >
            {task.status}
          </span>
          <PriorityIndicator priority={task.priority} variant="dot" size="sm" />
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
