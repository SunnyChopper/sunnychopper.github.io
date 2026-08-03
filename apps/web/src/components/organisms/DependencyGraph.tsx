import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import dagre from '@dagrejs/dagre';
import {
  Background,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitBranch, Loader2 } from 'lucide-react';
import type { Task, TaskDependency } from '@/types/growth-system';
import { EmptyState } from '@/components/molecules/EmptyState';
import { GraphCanvasToolbar } from '@/components/molecules/GraphCanvasToolbar';
import { TaskGraphNode, type TaskGraphRfNode } from '@/components/molecules/TaskGraphNode';
import {
  buildDependencyEdges,
  computeGraphStructureKey,
  minimapNodeColor,
  TASK_GRAPH_NODE_HEIGHT,
  TASK_GRAPH_NODE_WIDTH,
} from '@/lib/task-graph-utils';
import { cn } from '@/lib/utils';

interface DependencyGraphProps {
  tasks: Task[];
  dependencies: TaskDependency[];
  isLoading?: boolean;
  onTaskClick?: (taskId: string) => void;
  className?: string;
}

const nodeTypes = { taskGraph: TaskGraphNode };

const GRAPH_SHELL_CLASS =
  'relative h-[min(70vh,600px)] min-h-96 w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden';

const FIT_VIEW_PADDING = 0.18;
const FIT_VIEW_DURATION_MS = 280;

function layoutElements(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 40,
    ranksep: 64,
    marginx: 20,
    marginy: 20,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: TASK_GRAPH_NODE_WIDTH, height: TASK_GRAPH_NODE_HEIGHT });
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - TASK_GRAPH_NODE_WIDTH / 2,
        y: pos.y - TASK_GRAPH_NODE_HEIGHT / 2,
      },
    };
  });
}

function buildLayoutedGraph(
  tasks: Task[],
  dependencies: TaskDependency[]
): { nodes: TaskGraphRfNode[]; edges: Edge[] } {
  const flowNodes: TaskGraphRfNode[] = tasks.map((task) => ({
    id: task.id,
    type: 'taskGraph',
    position: { x: 0, y: 0 },
    data: { task },
    selected: false,
  }));

  const flowEdges = buildDependencyEdges(tasks, dependencies, null, true);
  const layoutedNodes = layoutElements(flowNodes, flowEdges) as TaskGraphRfNode[];
  return { nodes: layoutedNodes, edges: flowEdges };
}

function DependencyGraphFlow({
  tasks,
  dependencies,
  onTaskClick,
  className,
}: Omit<DependencyGraphProps, 'isLoading'>) {
  const { fitView } = useReactFlow();
  const reduceMotion = useReducedMotion() ?? false;
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const structureKey = useMemo(
    () => computeGraphStructureKey(tasks, dependencies),
    [tasks, dependencies]
  );

  const layoutedNodes = useMemo(
    () => buildLayoutedGraph(tasks, dependencies).nodes,
    [structureKey, tasks, dependencies]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const prevStructureKey = useRef(structureKey);

  useEffect(() => {
    const structureChanged = prevStructureKey.current !== structureKey;
    if (structureChanged) {
      prevStructureKey.current = structureKey;
      setNodes(layoutedNodes);
    } else {
      setNodes((current) =>
        current.map((node) => {
          const task = tasks.find((t) => t.id === node.id);
          if (!task) return node;
          return {
            ...node,
            data: { task },
            selected: node.id === selectedNode,
          };
        })
      );
    }
    setEdges(buildDependencyEdges(tasks, dependencies, selectedNode, reduceMotion));
  }, [
    structureKey,
    layoutedNodes,
    tasks,
    dependencies,
    selectedNode,
    reduceMotion,
    setNodes,
    setEdges,
  ]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const id = requestAnimationFrame(() => {
      void fitView({
        padding: FIT_VIEW_PADDING,
        duration: reduceMotion ? 0 : FIT_VIEW_DURATION_MS,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [structureKey, nodes.length, fitView, reduceMotion]);

  const onNodeClick = useCallback(
    (_event: MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      onTaskClick?.(node.id);
    },
    [onTaskClick]
  );

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedNode) ?? null,
    [tasks, selectedNode]
  );

  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const hasDependencies = dependencies.length > 0;
  const motionDuration = reduceMotion ? 0 : 0.3;
  const detailMotionDuration = reduceMotion ? 0 : 0.2;

  return (
    <motion.div
      initial={{ opacity: reduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: motionDuration }}
      className={cn('bg-white dark:bg-gray-800', className)}
    >
      <div className={GRAPH_SHELL_CLASS}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-gray-50 dark:bg-gray-900/50"
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          }}
        >
          <Background gap={16} size={1} className="!bg-gray-50 dark:!bg-gray-900/50" />
          <Panel position="top-left" className="!m-3">
            <GraphCanvasToolbar reduceMotion={reduceMotion} />
          </Panel>
          {!hasDependencies && tasks.length > 0 ? (
            <Panel position="top-center" className="!m-3">
              <p className="rounded-md border border-gray-200/80 bg-white/90 px-3 py-1.5 text-xs text-gray-600 shadow-sm backdrop-blur-sm dark:border-gray-600/80 dark:bg-gray-800/90 dark:text-gray-400">
                No dependency links yet — tasks shown as standalone nodes
              </p>
            </Panel>
          ) : null}
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor={(node) => {
              const task = taskById.get(node.id);
              return task ? minimapNodeColor(task) : '#94a3b8';
            }}
            className="!rounded-lg !border !border-gray-200 !bg-white/90 !shadow-sm dark:!border-gray-600 dark:!bg-gray-800/90"
            maskColor="rgba(0,0,0,0.06)"
          />
        </ReactFlow>
      </div>

      <AnimatePresence>
        {selectedTask ? (
          <motion.div
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
            transition={{ duration: detailMotionDuration }}
            className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Selected Task</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.title}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DependencyGraph({
  tasks,
  dependencies,
  isLoading = false,
  onTaskClick,
  className,
}: DependencyGraphProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const motionDuration = reduceMotion ? 0 : 0.3;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionDuration }}
        className={cn(
          'flex min-h-96 flex-col items-center justify-center gap-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
          className
        )}
        aria-busy="true"
        aria-label="Loading dependency graph"
      >
        <Loader2
          className={cn(
            'h-10 w-10 text-blue-600 dark:text-blue-400',
            !reduceMotion && 'animate-spin'
          )}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading dependency graph…</p>
        <div
          className={cn(
            'h-32 w-full max-w-md rounded-lg bg-gray-200/80 dark:bg-gray-700/80',
            !reduceMotion && 'animate-pulse'
          )}
        />
      </motion.div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <EmptyState
          icon={GitBranch}
          title="No tasks to map"
          description="Create tasks or adjust filters to see them on the dependency graph."
          className="py-16"
        />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <DependencyGraphFlow
        tasks={tasks}
        dependencies={dependencies}
        onTaskClick={onTaskClick}
        className={className}
      />
    </ReactFlowProvider>
  );
}
