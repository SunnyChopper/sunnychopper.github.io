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
import type { Project, ProjectDependency } from '@/types/growth-system';
import Button from '@/components/atoms/Button';
import { EmptyState } from '@/components/molecules/EmptyState';
import { GraphCanvasToolbar } from '@/components/molecules/GraphCanvasToolbar';
import { ProjectGraphNode, type ProjectGraphRfNode } from '@/components/molecules/ProjectGraphNode';
import {
  buildProjectDependencyEdges,
  computeProjectGraphStructureKey,
  findFocusNeighborDependency,
  projectMinimapNodeColor,
  PROJECT_GRAPH_NODE_HEIGHT,
  PROJECT_GRAPH_NODE_WIDTH,
} from '@/lib/projects/project-graph-utils';
import { cn } from '@/lib/utils';

interface ProjectDependencyMiniGraphProps {
  focusProject: Project;
  projects: Project[];
  dependencies: ProjectDependency[];
  isLoading?: boolean;
  onProjectClick?: (projectId: string) => void;
  onRemoveDependency?: (dependency: ProjectDependency) => void;
  className?: string;
}

const nodeTypes = { projectGraph: ProjectGraphNode };

const GRAPH_SHELL_CLASS =
  'relative h-64 min-h-56 w-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden';

const FIT_VIEW_PADDING = 0.22;
const FIT_VIEW_DURATION_MS = 280;

function layoutElements(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 36,
    ranksep: 56,
    marginx: 16,
    marginy: 16,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: PROJECT_GRAPH_NODE_WIDTH, height: PROJECT_GRAPH_NODE_HEIGHT });
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
        x: pos.x - PROJECT_GRAPH_NODE_WIDTH / 2,
        y: pos.y - PROJECT_GRAPH_NODE_HEIGHT / 2,
      },
    };
  });
}

function buildLayoutedGraph(
  focusProject: Project,
  projects: Project[],
  dependencies: ProjectDependency[]
): { nodes: ProjectGraphRfNode[]; edges: Edge[] } {
  const flowNodes: ProjectGraphRfNode[] = projects.map((project) => ({
    id: project.id,
    type: 'projectGraph',
    position: { x: 0, y: 0 },
    data: { project, isFocus: project.id === focusProject.id },
    selected: false,
  }));

  const flowEdges = buildProjectDependencyEdges(projects, dependencies, null, true);
  const layoutedNodes = layoutElements(flowNodes, flowEdges) as ProjectGraphRfNode[];
  return { nodes: layoutedNodes, edges: flowEdges };
}

function ProjectDependencyMiniGraphFlow({
  focusProject,
  projects,
  dependencies,
  onProjectClick,
  onRemoveDependency,
  className,
}: Omit<ProjectDependencyMiniGraphProps, 'isLoading'>) {
  const { fitView } = useReactFlow();
  const reduceMotion = useReducedMotion() ?? false;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const structureKey = useMemo(
    () => computeProjectGraphStructureKey(projects, dependencies),
    [projects, dependencies]
  );

  const layoutedNodes = useMemo(
    () => buildLayoutedGraph(focusProject, projects, dependencies).nodes,
    [structureKey, focusProject, projects, dependencies]
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
          const project = projects.find((p) => p.id === node.id);
          if (!project) return node;
          return {
            ...node,
            data: { project, isFocus: project.id === focusProject.id },
            selected: node.id === selectedNodeId,
          };
        })
      );
    }
    setEdges(buildProjectDependencyEdges(projects, dependencies, selectedNodeId, reduceMotion));
  }, [
    structureKey,
    layoutedNodes,
    projects,
    dependencies,
    selectedNodeId,
    reduceMotion,
    focusProject.id,
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
      setSelectedNodeId(node.id);
      if (node.id !== focusProject.id) {
        onProjectClick?.(node.id);
      }
    },
    [focusProject.id, onProjectClick]
  );

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedNodeId) ?? null,
    [projects, selectedNodeId]
  );

  const selectedEdge = useMemo(() => {
    if (!selectedNodeId || selectedNodeId === focusProject.id) return null;
    return findFocusNeighborDependency(focusProject.id, selectedNodeId, dependencies);
  }, [selectedNodeId, focusProject.id, dependencies]);

  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

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
          <Panel position="top-left" className="!m-2">
            <GraphCanvasToolbar reduceMotion={reduceMotion} />
          </Panel>
          {!hasDependencies ? (
            <Panel position="top-center" className="!m-2">
              <p className="rounded-md border border-gray-200/80 bg-white/90 px-3 py-1.5 text-xs text-gray-600 shadow-sm backdrop-blur-sm dark:border-gray-600/80 dark:bg-gray-800/90 dark:text-gray-400">
                No finish-to-start links yet — draw a connector on the Timeline
              </p>
            </Panel>
          ) : null}
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor={(node) => {
              const project = projectById.get(node.id);
              return project ? projectMinimapNodeColor(project) : '#94a3b8';
            }}
            className="!rounded-lg !border !border-gray-200 !bg-white/90 !shadow-sm dark:!border-gray-600 dark:!bg-gray-800/90"
            maskColor="rgba(0,0,0,0.06)"
          />
        </ReactFlow>
      </div>

      <AnimatePresence>
        {selectedProject && selectedEdge ? (
          <motion.div
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
            transition={{ duration: detailMotionDuration }}
            className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Finish-to-start link
              </p>
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {projectById.get(selectedEdge.predecessorProjectId)?.name ?? 'Unknown'} →{' '}
                {projectById.get(selectedEdge.successorProjectId)?.name ?? 'Unknown'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Lag: {selectedEdge.lagDays} day{selectedEdge.lagDays === 1 ? '' : 's'}
              </p>
            </div>
            {onRemoveDependency ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => onRemoveDependency(selectedEdge)}
              >
                Remove link
              </Button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProjectDependencyMiniGraph({
  focusProject,
  projects,
  dependencies,
  isLoading = false,
  onProjectClick,
  onRemoveDependency,
  className,
}: ProjectDependencyMiniGraphProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const motionDuration = reduceMotion ? 0 : 0.3;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionDuration }}
        className={cn(
          'flex h-64 min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800',
          className
        )}
        aria-busy="true"
        aria-label="Loading dependency graph"
      >
        <Loader2
          className={cn(
            'h-8 w-8 text-blue-600 dark:text-blue-400',
            !reduceMotion && 'animate-spin'
          )}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading dependencies…</p>
      </motion.div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <EmptyState
          icon={GitBranch}
          title="No project to map"
          description="Select a project to view its dependency neighborhood."
          className="py-12"
        />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <ProjectDependencyMiniGraphFlow
        focusProject={focusProject}
        projects={projects}
        dependencies={dependencies}
        onProjectClick={onProjectClick}
        onRemoveDependency={onRemoveDependency}
        className={className}
      />
    </ReactFlowProvider>
  );
}
