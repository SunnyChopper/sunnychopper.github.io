import { describe, expect, it } from 'vitest';
import type { Goal, Project } from '@/types/growth-system';
import {
  areasWithLinkedEntities,
  filterLinkableGoals,
  filterLinkableProjects,
  groupLogbookEntitiesByArea,
  isLogbookEntityLinked,
} from '@/lib/growth-system/logbook-linkable-entities';

const baseProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: 'project-1',
    name: 'Personal OS',
    area: 'Operations',
    status: 'Active',
    ...overrides,
  }) as Project;

const baseGoal = (overrides: Partial<Goal> = {}): Goal =>
  ({
    id: 'goal-1',
    title: 'AI curiosity',
    area: 'Day Job',
    status: 'Active',
    ...overrides,
  }) as Goal;

describe('logbook-linkable-entities', () => {
  it('filters terminal goals and completed/archived projects', () => {
    expect(filterLinkableGoals([baseGoal({ status: 'Achieved' })])).toHaveLength(0);
    expect(filterLinkableProjects([baseProject({ status: 'Completed' })])).toHaveLength(0);
    expect(filterLinkableGoals([baseGoal()])).toHaveLength(1);
    expect(filterLinkableProjects([baseProject()])).toHaveLength(1);
  });

  it('groups entities by area in AREAS order', () => {
    const groups = groupLogbookEntitiesByArea(
      [baseProject({ area: 'Operations' }), baseProject({ id: 'p2', area: 'Health' })],
      [baseGoal({ area: 'Day Job' })]
    );
    expect(groups.map((group) => group.area)).toEqual(['Health', 'Operations', 'Day Job']);
  });

  it('detects linked entities and expands areas with selections', () => {
    const projects = [baseProject()];
    const goals = [baseGoal()];
    const linked = [
      { entityType: 'project' as const, entityId: 'project-1', entityName: 'Personal OS' },
    ];
    expect(isLogbookEntityLinked(linked, 'project', 'project-1')).toBe(true);
    expect(areasWithLinkedEntities(linked, projects, goals)).toEqual(new Set(['Operations']));
  });
});
