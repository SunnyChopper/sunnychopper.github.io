import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import {
  AREAS,
  PRIORITIES,
  TASK_STATUSES,
  AREA_LABELS,
  TASK_STATUS_LABELS,
} from '@/constants/growth-system';
import type { Area, Priority, TaskListSortField, TaskStatus } from '@/types/growth-system';
import {
  getTasksActiveFilterChips,
  type DuePreset,
  type TasksFilterChipKey,
} from '@/lib/growth-system/tasks-filters';
import type { TasksEnergyTagFilter } from '@/lib/growth-system/tasks-deep-links';
import {
  tasksFilterChipClassName,
  tasksFilterChipRemoveClassName,
  tasksFilterFieldLabelClassName,
  tasksFilterSelectActiveClassName,
  tasksFilterSelectClassName,
  tasksFiltersEmptySummaryClassName,
  tasksFiltersGridClassName,
  tasksFiltersPanelClassName,
  tasksFiltersSummaryRowClassName,
} from '@/lib/growth-system/tasks-filters-surfaces';
import { cn } from '@/lib/utils';

const AREA_OPTIONS: Area[] = [...AREAS];
const STATUS_OPTIONS: TaskStatus[] = [...TASK_STATUSES];
const PRIORITY_OPTIONS: Priority[] = [...PRIORITIES];

export const TASKS_FILTERS_PANEL_ID = 'tasks-filters-panel';

export type TasksFiltersBarProps = {
  id?: string;
  taskSortField: TaskListSortField;
  onTaskSortFieldChange: (value: TaskListSortField) => void;
  duePreset: DuePreset;
  onDuePresetChange: (value: DuePreset) => void;
  selectedArea?: Area;
  onAreaChange: (value?: Area) => void;
  selectedStatus?: TaskStatus;
  onStatusChange: (value?: TaskStatus) => void;
  selectedPriority?: Priority;
  onPriorityChange: (value?: Priority) => void;
  energyTag: TasksEnergyTagFilter;
  onEnergyTagChange: (value: TasksEnergyTagFilter) => void;
  showDeletedOnly: boolean;
  onShowDeletedOnlyChange: (value: boolean) => void;
  activeFilterCount: number;
  onClearAll: () => void;
  onClose: () => void;
};

function FilterSelect({
  id,
  label,
  value,
  onChange,
  isActive,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={tasksFilterFieldLabelClassName}>
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(tasksFilterSelectClassName, isActive && tasksFilterSelectActiveClassName)}
      >
        {children}
      </Select>
    </div>
  );
}

export default function TasksFiltersBar({
  id = TASKS_FILTERS_PANEL_ID,
  taskSortField,
  onTaskSortFieldChange,
  duePreset,
  onDuePresetChange,
  selectedArea,
  onAreaChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  energyTag,
  onEnergyTagChange,
  showDeletedOnly,
  onShowDeletedOnlyChange,
  activeFilterCount,
  onClearAll,
  onClose,
}: TasksFiltersBarProps) {
  const activeChips = getTasksActiveFilterChips({
    selectedArea,
    selectedStatus,
    selectedPriority,
    duePreset,
    energyTag,
    showDeletedOnly,
  });

  const handleRemoveChip = (key: TasksFilterChipKey) => {
    switch (key) {
      case 'due':
        onDuePresetChange('none');
        break;
      case 'area':
        onAreaChange(undefined);
        break;
      case 'status':
        onStatusChange(undefined);
        break;
      case 'priority':
        onPriorityChange(undefined);
        break;
      case 'energyTag':
        onEnergyTagChange('any');
        break;
      case 'deleted':
        onShowDeletedOnlyChange(false);
        break;
      default:
        break;
    }
  };

  return (
    <div id={id} className={tasksFiltersPanelClassName}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClearAll}
            disabled={activeFilterCount === 0}
            aria-label="Clear all filters"
            className="min-h-[36px] gap-1"
          >
            <X className="h-4 w-4" aria-hidden />
            Clear all
          </Button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className={tasksFiltersSummaryRowClassName}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {activeChips.length > 0 ? (
          activeChips.map((chip) => (
            <span key={chip.key} className={tasksFilterChipClassName}>
              {chip.label}
              <button
                type="button"
                onClick={() => handleRemoveChip(chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                className={tasksFilterChipRemoveClassName}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))
        ) : (
          <span className={tasksFiltersEmptySummaryClassName}>No filters applied</span>
        )}
      </div>

      <div className={tasksFiltersGridClassName}>
        <FilterSelect
          id="tasks-filter-sort"
          label="Sort by"
          value={taskSortField}
          onChange={(value) => onTaskSortFieldChange(value as TaskListSortField)}
          isActive={false}
        >
          <option value="priority">Priority</option>
          <option value="size">Story points</option>
          <option value="pointValue">Reward points</option>
          <option value="dueDate">Due date</option>
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-due"
          label="Due date"
          value={duePreset}
          onChange={(value) => onDuePresetChange(value as DuePreset)}
          isActive={duePreset !== 'none'}
        >
          <option value="none">Any due date</option>
          <option value="today">Due today</option>
          <option value="tomorrow">Due tomorrow</option>
          <option value="week">Due this week</option>
          <option value="month">Due this month</option>
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-area"
          label="Area"
          value={selectedArea || ''}
          onChange={(value) => onAreaChange((value as Area) || undefined)}
          isActive={!!selectedArea}
        >
          <option value="">All Areas</option>
          {AREA_OPTIONS.map((area) => (
            <option key={area} value={area}>
              {AREA_LABELS[area]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-status"
          label="Status"
          value={selectedStatus || ''}
          onChange={(value) => onStatusChange((value as TaskStatus) || undefined)}
          isActive={!!selectedStatus}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-priority"
          label="Priority"
          value={selectedPriority || ''}
          onChange={(value) => onPriorityChange((value as Priority) || undefined)}
          isActive={!!selectedPriority}
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-view"
          label="View"
          value={showDeletedOnly ? 'deleted' : 'active'}
          onChange={(value) => {
            const deleted = value === 'deleted';
            onShowDeletedOnlyChange(deleted);
            if (deleted) {
              onStatusChange(undefined);
            }
          }}
          isActive={showDeletedOnly}
        >
          <option value="active">Active tasks</option>
          <option value="deleted">Deleted</option>
        </FilterSelect>

        <FilterSelect
          id="tasks-filter-energy-tag"
          label="Energy tag"
          value={energyTag}
          onChange={(value) => onEnergyTagChange(value as TasksEnergyTagFilter)}
          isActive={energyTag === 'untagged'}
        >
          <option value="any">Any energy tag</option>
          <option value="untagged">Untagged only</option>
        </FilterSelect>
      </div>
    </div>
  );
}
