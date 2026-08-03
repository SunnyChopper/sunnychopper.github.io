import type { Project } from '@/types/growth-system';
import type { ProjectDisplayModel } from '@/utils/project-summary';

/** Shared fixture for Grid/List status badge parity (Personal Branding Automation scenario). */
export const stalePlanningProjectFixture: Project = {
  id: 'project-branding',
  name: 'Personal Branding Automation',
  description: null,
  area: 'Wealth',
  subCategory: null,
  priority: 'P3',
  status: 'Planning',
  impact: 2,
  startDate: '2026-03-11',
  targetEndDate: '2026-03-16',
  actualEndDate: null,
  isStale: true,
  notes: null,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const stalePlanningDisplayFixture: ProjectDisplayModel = {
  progressPercent: 0,
  isWorkComplete: false,
  effectiveStatus: 'Planning',
  isStale: true,
};
