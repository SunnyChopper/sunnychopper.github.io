import type { Area, Priority, Project, ProjectStatus } from '@/types/growth-system';
import { AREA_LABELS, PROJECT_STATUS_LABELS } from '@/constants/growth-system';

export type ProjectsFilterChipKey = 'area' | 'status' | 'priority';

export type ProjectsFilterChip = {
  key: ProjectsFilterChipKey;
  label: string;
};

export type ProjectsViewFilters = {
  area?: Area;
  status?: ProjectStatus;
  priority?: Priority;
};

export function filterProjectsForView(
  projects: Project[],
  input: {
    searchQuery?: string;
    filters?: ProjectsViewFilters;
  }
): Project[] {
  const search = (input.searchQuery ?? '').trim().toLowerCase();
  const filters = input.filters ?? {};

  return projects.filter((project) => {
    if (search && !project.name.toLowerCase().includes(search)) {
      return false;
    }
    if (filters.status) {
      if (project.status !== filters.status) {
        return false;
      }
    } else if (project.status === 'Archived') {
      return false;
    }
    if (filters.area && project.area !== filters.area) {
      return false;
    }
    if (filters.priority && project.priority !== filters.priority) {
      return false;
    }
    return true;
  });
}

export function countProjectsActiveFilters(input: {
  selectedArea?: Area;
  selectedStatus?: ProjectStatus;
  selectedPriority?: Priority;
}): number {
  return [input.selectedArea, input.selectedStatus, input.selectedPriority].filter(Boolean).length;
}

export function getProjectsActiveFilterChips(input: {
  selectedArea?: Area;
  selectedStatus?: ProjectStatus;
  selectedPriority?: Priority;
}): ProjectsFilterChip[] {
  const chips: ProjectsFilterChip[] = [];

  if (input.selectedArea) {
    chips.push({
      key: 'area',
      label: `Area: ${AREA_LABELS[input.selectedArea]}`,
    });
  }

  if (input.selectedStatus) {
    chips.push({
      key: 'status',
      label: `Status: ${PROJECT_STATUS_LABELS[input.selectedStatus]}`,
    });
  }

  if (input.selectedPriority) {
    chips.push({
      key: 'priority',
      label: `Priority: ${input.selectedPriority}`,
    });
  }

  return chips;
}
