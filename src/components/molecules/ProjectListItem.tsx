import { Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@/types/growth-system';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import Button from '@/components/atoms/Button';
import {
  ProjectDueRow,
  ProjectMetaRow,
  ProjectProgressRow,
} from '@/components/molecules/ProjectSummaryBlocks';

interface ProjectListItemProps {
  project: Project;
  onClick: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  taskCount?: number;
  completedTaskCount?: number;
  hasHealthData?: boolean;
  isHealthLoading?: boolean;
}

export function ProjectListItem({
  project,
  onClick,
  onEdit,
  onDelete,
  taskCount = 0,
  completedTaskCount = 0,
  hasHealthData = false,
  isHealthLoading = false,
}: ProjectListItemProps) {
  const handleClick = () => {
    onClick(project);
  };

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      onClick={(e) => {
        // Don't trigger click if clicking on action buttons
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        handleClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View project details: ${project.name}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-4">
        <div className="grid grid-cols-1 gap-3 flex-1 min-w-0 lg:grid-cols-12 lg:grid-rows-2 lg:gap-x-4 lg:gap-y-2">
          <div className="min-w-0 lg:col-span-5 lg:row-span-2">
            <div className="flex items-center gap-2 mb-2">
              <PriorityIndicator priority={project.priority} size="sm" variant="badge" />
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
                {project.name}
              </h3>
              <StatusBadge status={project.status} size="sm" />
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="lg:col-span-3">
            <ProjectDueRow project={project} />
          </div>
          <div className="lg:col-span-3">
            <ProjectProgressRow
              project={project}
              taskCount={taskCount}
              completedTaskCount={completedTaskCount}
              hasHealthData={hasHealthData}
              isHealthLoading={isHealthLoading}
              showProgressBar
              showProgressLabel
            />
          </div>
          <div className="lg:col-span-6 lg:col-start-6 lg:row-start-2">
            <ProjectMetaRow project={project} className="lg:justify-end" />
          </div>
        </div>

        <div
          className="flex items-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="group"
          aria-label="Project actions"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(project)}
            className="!p-2 hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/20 dark:hover:!text-blue-400"
            aria-label={`Edit project: ${project.name}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(project)}
            className="!p-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/20 dark:hover:!text-red-400"
            aria-label={`Delete project: ${project.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
