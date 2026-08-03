import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import Button from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import {
  AREAS,
  PRIORITIES,
  PROJECT_STATUSES,
  AREA_LABELS,
  PROJECT_STATUS_LABELS,
} from '@/constants/growth-system';
import type { Area, Priority, ProjectStatus } from '@/types/growth-system';
import {
  getProjectsActiveFilterChips,
  type ProjectsFilterChipKey,
} from '@/lib/growth-system/projects-filters';
import {
  projectsFilterChipClassName,
  projectsFilterChipRemoveClassName,
  projectsFilterFieldLabelClassName,
  projectsFilterSelectActiveClassName,
  projectsFilterSelectClassName,
  projectsFiltersEmptySummaryClassName,
  projectsFiltersGridClassName,
  projectsFiltersPanelClassName,
  projectsFiltersSummaryRowClassName,
} from '@/lib/growth-system/projects-filters-surfaces';
import { cn } from '@/lib/utils';

const AREA_OPTIONS: Area[] = [...AREAS];
const STATUS_OPTIONS: ProjectStatus[] = [...PROJECT_STATUSES];
const PRIORITY_OPTIONS: Priority[] = [...PRIORITIES];

export const PROJECTS_FILTERS_PANEL_ID = 'projects-filters-panel';

export type ProjectsFiltersBarProps = {
  id?: string;
  selectedArea?: Area;
  onAreaChange: (value?: Area) => void;
  selectedStatus?: ProjectStatus;
  onStatusChange: (value?: ProjectStatus) => void;
  selectedPriority?: Priority;
  onPriorityChange: (value?: Priority) => void;
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
      <label htmlFor={id} className={projectsFilterFieldLabelClassName}>
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          projectsFilterSelectClassName,
          isActive && projectsFilterSelectActiveClassName
        )}
      >
        {children}
      </Select>
    </div>
  );
}

export default function ProjectsFiltersBar({
  id = PROJECTS_FILTERS_PANEL_ID,
  selectedArea,
  onAreaChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  activeFilterCount,
  onClearAll,
  onClose,
}: ProjectsFiltersBarProps) {
  const activeChips = getProjectsActiveFilterChips({
    selectedArea,
    selectedStatus,
    selectedPriority,
  });

  const handleRemoveChip = (key: ProjectsFilterChipKey) => {
    switch (key) {
      case 'area':
        onAreaChange(undefined);
        break;
      case 'status':
        onStatusChange(undefined);
        break;
      case 'priority':
        onPriorityChange(undefined);
        break;
      default:
        break;
    }
  };

  return (
    <div id={id} className={projectsFiltersPanelClassName}>
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
        className={projectsFiltersSummaryRowClassName}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {activeChips.length > 0 ? (
          activeChips.map((chip) => (
            <span key={chip.key} className={projectsFilterChipClassName}>
              {chip.label}
              <button
                type="button"
                onClick={() => handleRemoveChip(chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                className={projectsFilterChipRemoveClassName}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))
        ) : (
          <span className={projectsFiltersEmptySummaryClassName}>No filters applied</span>
        )}
      </div>

      <div className={projectsFiltersGridClassName}>
        <FilterSelect
          id="projects-filter-area"
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
          id="projects-filter-status"
          label="Status"
          value={selectedStatus || ''}
          onChange={(value) => onStatusChange((value as ProjectStatus) || undefined)}
          isActive={!!selectedStatus}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {PROJECT_STATUS_LABELS[status]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="projects-filter-priority"
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
      </div>
    </div>
  );
}
