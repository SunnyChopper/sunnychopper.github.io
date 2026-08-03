import { X } from 'lucide-react';
import Button from '@/components/atoms/Button';
import type { Area, Priority, ProjectStatus } from '@/types/growth-system';
import {
  getProjectsActiveFilterChips,
  type ProjectsFilterChipKey,
} from '@/lib/growth-system/projects-filters';
import {
  projectsActiveChipsRowClassName,
  projectsFilterChipClassName,
  projectsFilterChipRemoveClassName,
} from '@/lib/growth-system/projects-filters-surfaces';

export type ProjectsActiveFilterChipsProps = {
  selectedArea?: Area;
  selectedStatus?: ProjectStatus;
  selectedPriority?: Priority;
  onAreaChange: (value?: Area) => void;
  onStatusChange: (value?: ProjectStatus) => void;
  onPriorityChange: (value?: Priority) => void;
  onClearAll: () => void;
};

export default function ProjectsActiveFilterChips({
  selectedArea,
  selectedStatus,
  selectedPriority,
  onAreaChange,
  onStatusChange,
  onPriorityChange,
  onClearAll,
}: ProjectsActiveFilterChipsProps) {
  const activeChips = getProjectsActiveFilterChips({
    selectedArea,
    selectedStatus,
    selectedPriority,
  });

  if (activeChips.length === 0) {
    return null;
  }

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
    <div
      className={projectsActiveChipsRowClassName}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {activeChips.map((chip) => (
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
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onClearAll}
        aria-label="Clear all filters"
        className="min-h-[28px] gap-1"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear all
      </Button>
    </div>
  );
}
