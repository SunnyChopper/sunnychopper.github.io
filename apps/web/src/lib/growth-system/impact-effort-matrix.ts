import type { Area, Priority, Project, Task } from '@/types/growth-system';
import { getTasksByProject } from '@/utils/growth-system-filters';

export type ImpactEffortQuadrantKey = 'quickWins' | 'strategicBets' | 'fillIns' | 'killZone';

export interface ImpactEffortPoint {
  projectId: string;
  name: string;
  impact: number | null;
  remainingStoryPoints: number;
  priority: Priority;
  area: Area;
  hasUnestimatedRemainingTasks: boolean;
  isUnscored: boolean;
  quadrant: ImpactEffortQuadrantKey | null;
}

export const IMPACT_EFFORT_QUADRANT_ORDER: ImpactEffortQuadrantKey[] = [
  'quickWins',
  'strategicBets',
  'fillIns',
  'killZone',
];

export const IMPACT_EFFORT_QUADRANT_LABELS: Record<
  ImpactEffortQuadrantKey,
  { title: string; subtitle: string }
> = {
  quickWins: {
    title: 'Quick wins',
    subtitle: 'High impact / lower effort',
  },
  strategicBets: {
    title: 'Strategic bets',
    subtitle: 'High impact / higher effort',
  },
  fillIns: {
    title: 'Fill-ins',
    subtitle: 'Lower impact / lower effort',
  },
  killZone: {
    title: 'Kill / de-scope',
    subtitle: 'Low impact / high effort',
  },
};

const HIGH_IMPACT_THRESHOLD = 4;

export function isProjectImpactScored(impact: number | null | undefined): boolean {
  return typeof impact === 'number' && impact > 0;
}

export function computeRemainingStoryPoints(tasks: Task[]): number {
  return tasks.reduce((sum, task) => {
    if (task.status === 'Done') return sum;
    const size = task.size;
    if (typeof size === 'number' && size > 0) return sum + size;
    return sum;
  }, 0);
}

export function hasUnestimatedRemainingTasks(tasks: Task[]): boolean {
  return tasks.some((task) => {
    if (task.status === 'Done') return false;
    const size = task.size;
    return !(typeof size === 'number' && size > 0);
  });
}

/** Median of positive values; returns 1 when none are positive (effort mid-line fallback). */
export function medianPositive(values: number[]): number {
  const positive = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (positive.length === 0) return 1;

  const mid = Math.floor(positive.length / 2);
  if (positive.length % 2 === 1) return positive[mid];
  return (positive[mid - 1] + positive[mid]) / 2;
}

export function classifyImpactEffortQuadrant(
  impact: number,
  remainingStoryPoints: number,
  effortMedian: number
): ImpactEffortQuadrantKey {
  const isHighImpact = impact >= HIGH_IMPACT_THRESHOLD;
  const isHighEffort = remainingStoryPoints > effortMedian;

  if (isHighImpact && !isHighEffort) return 'quickWins';
  if (isHighImpact && isHighEffort) return 'strategicBets';
  if (!isHighImpact && !isHighEffort) return 'fillIns';
  return 'killZone';
}

export function buildImpactEffortPoint(project: Project, tasks: Task[]): ImpactEffortPoint {
  const projectTasks = getTasksByProject(tasks, project.id);
  const remainingStoryPoints = computeRemainingStoryPoints(projectTasks);
  const unscored = !isProjectImpactScored(project.impact);

  return {
    projectId: project.id,
    name: project.name,
    impact: unscored ? null : project.impact,
    remainingStoryPoints,
    priority: project.priority,
    area: project.area,
    hasUnestimatedRemainingTasks: hasUnestimatedRemainingTasks(projectTasks),
    isUnscored: unscored,
    quadrant: null,
  };
}

export function buildImpactEffortPoints(projects: Project[], tasks: Task[]): ImpactEffortPoint[] {
  const points = projects.map((project) => buildImpactEffortPoint(project, tasks));
  const effortMedian = medianPositive(points.map((point) => point.remainingStoryPoints));

  return points.map((point) => {
    if (point.isUnscored || point.impact == null) return point;
    return {
      ...point,
      quadrant: classifyImpactEffortQuadrant(
        point.impact,
        point.remainingStoryPoints,
        effortMedian
      ),
    };
  });
}

export function partitionByQuadrant(
  points: ImpactEffortPoint[]
): Record<ImpactEffortQuadrantKey, ImpactEffortPoint[]> {
  const buckets: Record<ImpactEffortQuadrantKey, ImpactEffortPoint[]> = {
    quickWins: [],
    strategicBets: [],
    fillIns: [],
    killZone: [],
  };

  for (const point of points) {
    if (!point.quadrant) continue;
    buckets[point.quadrant].push(point);
  }

  return buckets;
}

export function splitScoredImpactEffortPoints(points: ImpactEffortPoint[]): {
  scored: ImpactEffortPoint[];
  unscored: ImpactEffortPoint[];
  effortMedian: number;
} {
  const effortMedian = medianPositive(points.map((point) => point.remainingStoryPoints));
  const scored = points.filter((point) => !point.isUnscored && point.impact != null);
  const unscored = points.filter((point) => point.isUnscored);
  return { scored, unscored, effortMedian };
}
