import { useId, useMemo, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import type { Priority, Project, Task } from '@/types/growth-system';
import { IMPACT_LABELS } from '@/constants/project-summary';
import { cn } from '@/lib/utils';
import {
  IMPACT_EFFORT_QUADRANT_LABELS,
  IMPACT_EFFORT_QUADRANT_ORDER,
  buildImpactEffortPoints,
  partitionByQuadrant,
  splitScoredImpactEffortPoints,
  type ImpactEffortPoint,
  type ImpactEffortQuadrantKey,
} from '@/lib/growth-system/impact-effort-matrix';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';

const PRIORITY_DOT_COLORS: Record<Priority, string> = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#eab308',
  P4: '#22c55e',
};

const IMPACT_Y_MIN = 1;
const IMPACT_Y_MAX = 5;
const IMPACT_SPLIT_Y = 3.5;

const QUADRANT_WASH: Record<ImpactEffortQuadrantKey, string> = {
  quickWins: 'fill-emerald-500/8 dark:fill-emerald-400/10',
  strategicBets: 'fill-blue-500/8 dark:fill-blue-400/10',
  fillIns: 'fill-slate-400/8 dark:fill-slate-500/10',
  killZone: 'fill-amber-500/12 dark:fill-amber-400/12',
};

interface ImpactEffortMatrixProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (project: Project) => void;
  selectedProjectId?: string | null;
  className?: string;
}

function formatStoryPointsLabel(points: number): string {
  return `${points} SP remaining`;
}

function MatrixTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((prev) => !prev)}
        className="rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-gray-300"
        aria-label="How the impact vs effort matrix works"
        aria-expanded={showTooltip}
        aria-describedby={showTooltip ? tooltipId : undefined}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {showTooltip ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-lg dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
        >
          <p className="font-medium text-gray-900 dark:text-white">Axes</p>
          <p className="mt-1">
            Y = Impact score (1–5). X = remaining story points summed from incomplete linked tasks.
          </p>
          <p className="mt-2">
            Effort split uses the median remaining SP among plotted projects. Low-impact /
            high-effort projects land in the kill zone for fast de-scope decisions.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ProjectMatrixListItem({
  point,
  isSelected,
  onSelect,
}: {
  point: ImpactEffortPoint;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const impactLabel =
    point.impact != null ? (IMPACT_LABELS[point.impact] ?? `Impact ${point.impact}`) : 'Unscored';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
        'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:bg-gray-800/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        isSelected && 'border-blue-400 bg-blue-50/60 dark:border-blue-500/60 dark:bg-blue-950/30'
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <PriorityIndicator priority={point.priority} variant="dot" size="sm" />
          <span className="truncate font-medium text-gray-900 dark:text-white">{point.name}</span>
        </div>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {impactLabel} · {formatStoryPointsLabel(point.remainingStoryPoints)}
          {point.hasUnestimatedRemainingTasks ? ' · Unestimated effort' : ''}
        </p>
      </div>
      {point.quadrant ? (
        <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
          {IMPACT_EFFORT_QUADRANT_LABELS[point.quadrant].title}
        </span>
      ) : null}
    </button>
  );
}

export function ImpactEffortMatrix({
  projects,
  tasks,
  onSelectProject,
  selectedProjectId,
  className,
}: ImpactEffortMatrixProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const points = useMemo(() => buildImpactEffortPoints(projects, tasks), [projects, tasks]);
  const { scored, unscored, effortMedian } = useMemo(
    () => splitScoredImpactEffortPoints(points),
    [points]
  );
  const quadrants = useMemo(() => partitionByQuadrant(points), [points]);

  const plot = useMemo(() => {
    if (scored.length === 0) {
      return {
        minX: 0,
        maxX: Math.max(effortMedian, 1),
        effortMedian,
      };
    }

    const xs = scored.map((point) => point.remainingStoryPoints);
    const maxX = Math.max(...xs, effortMedian);
    const padX = maxX === 0 ? 1 : Math.max(1, maxX * 0.12);
    return {
      minX: 0,
      maxX: maxX + padX,
      effortMedian,
    };
  }, [scored, effortMedian]);

  const w = 520;
  const h = 320;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 44;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const xScale = (x: number) => padL + ((x - plot.minX) / (plot.maxX - plot.minX || 1)) * innerW;
  const yScale = (impact: number) =>
    padT + innerH - ((impact - IMPACT_Y_MIN) / (IMPACT_Y_MAX - IMPACT_Y_MIN || 1)) * innerH;

  const splitX = xScale(plot.effortMedian);
  const splitY = yScale(IMPACT_SPLIT_Y);

  if (projects.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-900/40',
          className
        )}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No incomplete projects match your filters.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Impact vs Effort Matrix
            </h2>
            <MatrixTooltip />
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Compare portfolio impact against remaining story points. Use the kill zone to spot
            low-impact work that still costs a lot.
          </p>
        </div>
        <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          Effort split: {plot.effortMedian} SP median
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-900/50">
          {scored.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-600 dark:text-gray-400">
              Score impact on projects to plot them on the matrix.
            </p>
          ) : (
            <svg
              width="100%"
              viewBox={`0 0 ${w} ${h}`}
              className="max-w-full"
              role="img"
              aria-label="Impact versus remaining story points scatter plot"
            >
              <rect
                x={padL}
                y={padT}
                width={splitX - padL}
                height={splitY - padT}
                className={QUADRANT_WASH.quickWins}
              />
              <rect
                x={splitX}
                y={padT}
                width={padL + innerW - splitX}
                height={splitY - padT}
                className={QUADRANT_WASH.strategicBets}
              />
              <rect
                x={padL}
                y={splitY}
                width={splitX - padL}
                height={padT + innerH - splitY}
                className={QUADRANT_WASH.fillIns}
              />
              <rect
                x={splitX}
                y={splitY}
                width={padL + innerW - splitX}
                height={padT + innerH - splitY}
                className={QUADRANT_WASH.killZone}
              />

              <line
                x1={splitX}
                x2={splitX}
                y1={padT}
                y2={padT + innerH}
                className="stroke-gray-300 dark:stroke-gray-600"
                strokeDasharray="4 4"
              />
              <line
                x1={padL}
                x2={padL + innerW}
                y1={splitY}
                y2={splitY}
                className="stroke-gray-300 dark:stroke-gray-600"
                strokeDasharray="4 4"
              />

              <text x={padL} y={14} className="fill-gray-600 text-[11px] dark:fill-gray-400">
                Impact
              </text>
              <text
                x={w / 2}
                y={h - 8}
                textAnchor="middle"
                className="fill-gray-600 text-[11px] dark:fill-gray-400"
              >
                Remaining story points
              </text>

              {scored.map((point) => {
                if (point.impact == null) return null;
                const cx = xScale(point.remainingStoryPoints);
                const cy = yScale(point.impact);
                const isHovered = hoveredId === point.projectId;
                const isSelected = selectedProjectId === point.projectId;
                const fill = PRIORITY_DOT_COLORS[point.priority] ?? PRIORITY_DOT_COLORS.P3;

                return (
                  <g key={point.projectId}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered || isSelected ? 9 : 7}
                      fill={fill}
                      stroke={isSelected ? '#2563eb' : '#ffffff'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredId(point.projectId)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        const project = projectsById.get(point.projectId);
                        if (project) onSelectProject(project);
                      }}
                    >
                      <title>
                        {point.name}: impact {point.impact},{' '}
                        {formatStoryPointsLabel(point.remainingStoryPoints)}
                        {point.quadrant
                          ? `, ${IMPACT_EFFORT_QUADRANT_LABELS[point.quadrant].title}`
                          : ''}
                      </title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="space-y-4">
          {IMPACT_EFFORT_QUADRANT_ORDER.map((key) => {
            const items = quadrants[key];
            const isKillZone = key === 'killZone';
            const meta = IMPACT_EFFORT_QUADRANT_LABELS[key];

            return (
              <section
                key={key}
                className={cn(
                  'rounded-xl border p-3',
                  isKillZone
                    ? 'border-2 border-amber-400 bg-amber-50/40 ring-1 ring-amber-300/40 dark:border-amber-600/80 dark:bg-amber-950/20 dark:ring-amber-700/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40'
                )}
              >
                <div className="mb-2 flex items-start gap-2">
                  {isKillZone ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  ) : null}
                  <div>
                    <h3
                      className={cn(
                        'text-sm font-semibold',
                        isKillZone
                          ? 'text-amber-900 dark:text-amber-100'
                          : 'text-gray-900 dark:text-white'
                      )}
                    >
                      {meta.title} ({items.length})
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{meta.subtitle}</p>
                  </div>
                </div>
                {isKillZone && items.length > 0 ? (
                  <p className="mb-2 text-xs text-amber-800 dark:text-amber-200">
                    High remaining effort for low impact — strong candidates to kill or de-scope.
                  </p>
                ) : null}
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No projects</p>
                  ) : (
                    items.map((point) => {
                      const project = projectsById.get(point.projectId);
                      if (!project) return null;
                      return (
                        <ProjectMatrixListItem
                          key={point.projectId}
                          point={point}
                          isSelected={selectedProjectId === point.projectId}
                          onSelect={() => onSelectProject(project)}
                        />
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {unscored.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/30">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Unscored impact ({unscored.length})
          </h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Set an impact score (1–5) to place these projects on the matrix.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {unscored.map((point) => {
              const project = projectsById.get(point.projectId);
              if (!project) return null;
              return (
                <ProjectMatrixListItem
                  key={point.projectId}
                  point={point}
                  isSelected={selectedProjectId === point.projectId}
                  onSelect={() => onSelectProject(project)}
                />
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
