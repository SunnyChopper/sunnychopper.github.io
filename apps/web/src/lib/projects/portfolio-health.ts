import type { Project } from '@/types/growth-system';
import type { ProjectHealthSummary } from '@/types/project-health';
import type { ProjectDisplayModel } from '@/utils/project-summary';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const OPEN_STATUSES = new Set<Project['status']>(['Planning', 'Active', 'On Hold']);

export type PortfolioBucketCounts = {
  active: number;
  planning: number;
  stale: number;
  overdue: number;
};

export type ProjectDisplayResolver = (project: Project) => ProjectDisplayModel;

export const isOpenProjectStatus = (project: Project): boolean => OPEN_STATUSES.has(project.status);

export const isProjectOverdueForPortfolio = (
  project: Project,
  workComplete: boolean,
  nowMs: number = Date.now()
): boolean => {
  if (workComplete || project.status === 'Cancelled' || project.status === 'Completed') {
    return false;
  }
  if (!project.targetEndDate) return false;
  const daysRemaining = Math.ceil((new Date(project.targetEndDate).getTime() - nowMs) / MS_PER_DAY);
  return daysRemaining < 0;
};

export const countPortfolioBuckets = (
  projects: Project[],
  resolveDisplay: ProjectDisplayResolver,
  nowMs: number = Date.now()
): PortfolioBucketCounts => {
  let active = 0;
  let planning = 0;
  let stale = 0;
  let overdue = 0;

  for (const project of projects) {
    const display = resolveDisplay(project);
    if (project.status === 'Active') active += 1;
    if (project.status === 'Planning') planning += 1;
    if (display.isStale) stale += 1;
    if (isProjectOverdueForPortfolio(project, display.isWorkComplete, nowMs)) overdue += 1;
  }

  return { active, planning, stale, overdue };
};

export const averagePortfolioHealthScore = (
  scores: Array<number | null | undefined>
): number | null => {
  const valid = scores.filter(
    (score): score is number => typeof score === 'number' && Number.isFinite(score)
  );
  if (valid.length === 0) return null;
  const sum = valid.reduce((total, score) => total + score, 0);
  return Math.round(sum / valid.length);
};

export const resolvePortfolioHealthScore = (
  projects: Project[],
  healthMap: Map<string, ProjectHealthSummary>
): number | null => {
  const openProjects = projects.filter(isOpenProjectStatus);
  const scores = openProjects.map((project) => {
    const fromMap = healthMap.get(project.id)?.healthScore;
    if (typeof fromMap === 'number' && Number.isFinite(fromMap)) return fromMap;
    if (typeof project.healthScore === 'number' && Number.isFinite(project.healthScore)) {
      return project.healthScore;
    }
    return null;
  });
  return averagePortfolioHealthScore(scores);
};
