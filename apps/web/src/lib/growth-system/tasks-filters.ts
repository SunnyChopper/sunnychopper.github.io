import type { Area, Priority, TaskStatus } from '@/types/growth-system';
import { AREA_LABELS, TASK_STATUS_LABELS } from '@/constants/growth-system';
import type { TasksEnergyTagFilter } from '@/lib/growth-system/tasks-deep-links';

export type DuePreset = 'none' | 'today' | 'tomorrow' | 'week' | 'month';

export type TasksFilterChipKey = 'due' | 'area' | 'status' | 'priority' | 'energyTag' | 'deleted';

export type TasksFilterChip = {
  key: TasksFilterChipKey;
  label: string;
};

const DUE_PRESET_LABELS: Record<Exclude<DuePreset, 'none'>, string> = {
  today: 'Due today',
  tomorrow: 'Due tomorrow',
  week: 'Due this week',
  month: 'Due this month',
};

export function countTasksActiveFilters(input: {
  selectedArea?: Area;
  selectedStatus?: TaskStatus;
  selectedPriority?: Priority;
  duePreset: DuePreset;
  energyTag?: TasksEnergyTagFilter;
  showDeletedOnly?: boolean;
}): number {
  return [
    input.selectedArea,
    input.selectedStatus,
    input.selectedPriority,
    input.duePreset !== 'none' ? input.duePreset : null,
    input.energyTag === 'untagged' ? 'untagged' : null,
    input.showDeletedOnly ? 'deleted' : null,
  ].filter(Boolean).length;
}

export function getTasksActiveFilterChips(input: {
  selectedArea?: Area;
  selectedStatus?: TaskStatus;
  selectedPriority?: Priority;
  duePreset: DuePreset;
  energyTag?: TasksEnergyTagFilter;
  showDeletedOnly?: boolean;
}): TasksFilterChip[] {
  const chips: TasksFilterChip[] = [];

  if (input.showDeletedOnly) {
    chips.push({
      key: 'deleted',
      label: 'Deleted',
    });
  }

  if (input.duePreset !== 'none') {
    chips.push({
      key: 'due',
      label: DUE_PRESET_LABELS[input.duePreset],
    });
  }

  if (input.selectedArea) {
    chips.push({
      key: 'area',
      label: `Area: ${AREA_LABELS[input.selectedArea]}`,
    });
  }

  if (input.selectedStatus) {
    chips.push({
      key: 'status',
      label: `Status: ${TASK_STATUS_LABELS[input.selectedStatus]}`,
    });
  }

  if (input.selectedPriority) {
    chips.push({
      key: 'priority',
      label: `Priority: ${input.selectedPriority}`,
    });
  }

  if (input.energyTag === 'untagged') {
    chips.push({
      key: 'energyTag',
      label: 'Energy: Untagged',
    });
  }

  return chips;
}
