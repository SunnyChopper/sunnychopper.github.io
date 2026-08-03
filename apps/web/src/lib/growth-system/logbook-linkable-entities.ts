import type { Area, Goal, LogbookLinkedEntity, Project } from '@/types/growth-system';
import { AREAS } from '@/constants/growth-system';

const TERMINAL_GOAL_STATUSES = new Set(['Achieved', 'Abandoned']);
const EXCLUDED_PROJECT_STATUSES = new Set(['Archived', 'Completed']);

export function filterLinkableGoals(goals: Goal[]): Goal[] {
  return goals.filter((goal) => !TERMINAL_GOAL_STATUSES.has(goal.status));
}

export function filterLinkableProjects(projects: Project[]): Project[] {
  return projects.filter((project) => !EXCLUDED_PROJECT_STATUSES.has(project.status));
}

export type LogbookEntitiesByArea = {
  area: Area;
  projects: Project[];
  goals: Goal[];
};

export function groupLogbookEntitiesByArea(
  projects: Project[],
  goals: Goal[]
): LogbookEntitiesByArea[] {
  const linkableProjects = filterLinkableProjects(projects);
  const linkableGoals = filterLinkableGoals(goals);

  return AREAS.map((area) => ({
    area,
    projects: linkableProjects.filter((project) => project.area === area),
    goals: linkableGoals.filter((goal) => goal.area === area),
  })).filter((group) => group.projects.length > 0 || group.goals.length > 0);
}

export function areasWithLinkedEntities(
  linkedEntities: LogbookLinkedEntity[] | undefined,
  projects: Project[],
  goals: Goal[]
): Set<Area> {
  const areas = new Set<Area>();
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const goalById = new Map(goals.map((goal) => [goal.id, goal]));

  for (const link of linkedEntities ?? []) {
    if (link.entityType === 'project') {
      const project = projectById.get(link.entityId);
      if (project) areas.add(project.area);
    }
    if (link.entityType === 'goal') {
      const goal = goalById.get(link.entityId);
      if (goal) areas.add(goal.area);
    }
  }

  return areas;
}

export function isLogbookEntityLinked(
  linkedEntities: LogbookLinkedEntity[] | undefined,
  entityType: 'project' | 'goal',
  entityId: string
): boolean {
  return (linkedEntities ?? []).some(
    (row) => row.entityType === entityType && row.entityId === entityId
  );
}

export const LOGBOOK_LINK_CHIP_SELECTED_CLASS =
  'border-indigo-500 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200';

export const LOGBOOK_LINK_CHIP_DEFAULT_CLASS =
  'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400';
