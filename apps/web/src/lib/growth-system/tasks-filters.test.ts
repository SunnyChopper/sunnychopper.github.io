import { describe, expect, it } from 'vitest';
import type { Area, Priority, TaskStatus } from '@/types/growth-system';
import {
  countTasksActiveFilters,
  getTasksActiveFilterChips,
} from '@/lib/growth-system/tasks-filters';

describe('tasks-filters', () => {
  it('counts due/area/status/priority/energy filters', () => {
    expect(
      countTasksActiveFilters({
        duePreset: 'none',
      })
    ).toBe(0);

    expect(
      countTasksActiveFilters({
        duePreset: 'today',
        selectedArea: 'Health' as Area,
        selectedStatus: 'Not Started' as TaskStatus,
        selectedPriority: 'P1' as Priority,
        energyTag: 'untagged',
      })
    ).toBe(5);
  });

  it('counts deleted view filter', () => {
    expect(
      countTasksActiveFilters({
        duePreset: 'none',
        showDeletedOnly: true,
      })
    ).toBe(1);
  });

  it('builds removable chip labels for active filters', () => {
    const chips = getTasksActiveFilterChips({
      duePreset: 'week',
      selectedArea: 'Health' as Area,
      selectedStatus: 'Not Started' as TaskStatus,
      selectedPriority: 'P1' as Priority,
      energyTag: 'untagged',
    });

    expect(chips).toEqual([
      { key: 'due', label: 'Due this week' },
      { key: 'area', label: 'Area: Health' },
      { key: 'status', label: 'Status: Not Started' },
      { key: 'priority', label: 'Priority: P1' },
      { key: 'energyTag', label: 'Energy: Untagged' },
    ]);
  });

  it('includes deleted chip when viewing trash', () => {
    const chips = getTasksActiveFilterChips({
      duePreset: 'none',
      showDeletedOnly: true,
    });
    expect(chips).toEqual([{ key: 'deleted', label: 'Deleted' }]);
  });
});
