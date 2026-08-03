import { describe, expect, it } from 'vitest';
import type { Area, Priority, ProjectStatus, Project } from '@/types/growth-system';
import {
  countProjectsActiveFilters,
  filterProjectsForView,
  getProjectsActiveFilterChips,
} from '@/lib/growth-system/projects-filters';

describe('projects-filters', () => {
  it('counts only area/status/priority filters', () => {
    expect(countProjectsActiveFilters({})).toBe(0);

    expect(
      countProjectsActiveFilters({
        selectedArea: 'Health' as Area,
        selectedStatus: 'Active' as ProjectStatus,
        selectedPriority: 'P1' as Priority,
      })
    ).toBe(3);
  });

  it('builds removable chip labels for active filters', () => {
    const chips = getProjectsActiveFilterChips({
      selectedArea: 'Wealth' as Area,
      selectedStatus: 'Active' as ProjectStatus,
      selectedPriority: 'P1' as Priority,
    });

    expect(chips).toEqual([
      { key: 'area', label: 'Area: Wealth' },
      { key: 'status', label: 'Status: Active' },
      { key: 'priority', label: 'Priority: P1' },
    ]);
  });

  it('filterProjectsForView hides archived by default', () => {
    const projects: Project[] = [
      {
        id: '1',
        name: 'Active',
        description: null,
        area: 'Operations',
        subCategory: null,
        priority: 'P3',
        status: 'Active',
        impact: 3,
        startDate: null,
        targetEndDate: null,
        actualEndDate: null,
        notes: null,
        userId: 'u1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: '2',
        name: 'Archived',
        description: null,
        area: 'Operations',
        subCategory: null,
        priority: 'P3',
        status: 'Archived',
        impact: 3,
        startDate: null,
        targetEndDate: null,
        actualEndDate: null,
        notes: null,
        userId: 'u1',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    expect(filterProjectsForView(projects, {})).toHaveLength(1);
    expect(filterProjectsForView(projects, { filters: { status: 'Archived' } })).toHaveLength(1);
  });
});
