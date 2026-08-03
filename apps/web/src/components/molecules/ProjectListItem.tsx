import { motion } from 'framer-motion';
import { Calendar, Pencil, Trash2, ChevronRight, Archive, RotateCcw } from 'lucide-react';
import type { Project } from '@/types/growth-system';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { ProgressRing } from '@/components/atoms/ProgressRing';
import Button from '@/components/atoms/Button';
import { formatDateString } from '@/utils/date-formatters';
import {
  getDateUrgency,
  resolveProjectBadgeStatus,
  getProjectCardAccentBarClasses,
  projectProgressRingColor,
  type ProjectDisplayModel,
} from '@/utils/project-summary';
import { SUBCATEGORY_LABELS } from '@/constants/growth-system';
import { cn } from '@/lib/utils';

interface ProjectListItemProps {
  project: Project;
  onClick: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onArchive?: (project: Project) => void;
  onRevive?: (project: Project) => void;
  taskCount?: number;
  completedTaskCount?: number;
  hasHealthData?: boolean;
  isHealthLoading?: boolean;
  display?: ProjectDisplayModel;
  linkedGoalCount?: number;
}

export function ProjectListItem({
  project,
  onClick,
  onEdit,
  onDelete,
  onArchive,
  onRevive,
  taskCount = 0,
  completedTaskCount = 0,
  hasHealthData: _hasHealthData = false,
  isHealthLoading: _isHealthLoading = false,
  display,
  linkedGoalCount: _linkedGoalCount = 0,
}: ProjectListItemProps) {
  const handleClick = () => {
    onClick(project);
  };

  const progress =
    display?.progressPercent ??
    (taskCount > 0 ? Math.round(((completedTaskCount || 0) / taskCount) * 100) : 0);
  const isWorkComplete = display?.isWorkComplete ?? project.status === 'Completed';
  const badgeStatus = resolveProjectBadgeStatus(project, display);
  const progressRingColor = projectProgressRingColor(badgeStatus);
  const { showBar, barBgClass } = getProjectCardAccentBarClasses(project, isWorkComplete);
  const dateUrgency = getDateUrgency(project.targetEndDate, {
    hideWhenComplete:
      isWorkComplete || project.status === 'Cancelled' || project.status === 'Archived',
  });
  const cardOpacity = dateUrgency?.dimCard ? 0.75 : 1;
  const startDate = project.startDate ? formatDateString(project.startDate) : null;
  const endDate = project.targetEndDate ? formatDateString(project.targetEndDate) : null;
  const dateLabel =
    startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || 'No date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: cardOpacity, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-colors duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
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
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4 w-full">
        {showBar && <div className={cn('absolute left-0 top-0 bottom-0 w-1', barBgClass)} />}
        {/* Left: Priority + Title + Status + Area */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PriorityIndicator priority={project.priority} size="sm" variant="badge" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate mb-1">
              {project.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={badgeStatus} size="sm" appearance="quiet" />
              <AreaBadge area={project.area} size="sm" appearance="quiet" />
              {project.subCategory && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {SUBCATEGORY_LABELS[project.subCategory]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta rail: progress + date/overdue (fixed slots for scan rhythm) */}
        <div className="flex shrink-0 items-center gap-4">
          {/* Progress slot — always visible at all breakpoints */}
          <div className="flex w-[4.5rem] items-center justify-end gap-2">
            <ProgressRing
              progress={progress}
              size="sm"
              color={progressRingColor}
              showLabel={false}
            />
            <span className="w-10 text-right text-sm font-medium tabular-nums text-gray-900 dark:text-white">
              {progress}%
            </span>
          </div>

          {/* Date + overdue slot */}
          <div className="hidden lg:flex w-[13.5rem] flex-col items-end">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
              <span className="text-right text-sm text-gray-600 dark:text-gray-400">
                {dateLabel}
              </span>
            </div>
            {dateUrgency && dateUrgency.text && (
              <span
                className={cn(
                  'mt-0.5 inline-block self-end rounded-full px-2 py-0.5 text-xs font-medium text-right',
                  dateUrgency.color
                )}
              >
                {dateUrgency.text}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions + Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="group"
            aria-label="Project actions"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(project)}
              className="!p-2 hover:!bg-blue-50 hover:!text-blue-600 dark:hover:!bg-blue-900/20 dark:hover:!text-blue-400"
              aria-label={`Edit project: ${project.name}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            {project.status === 'Archived' && onRevive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevive(project)}
                className="!p-2 hover:!bg-green-50 hover:!text-green-600 dark:hover:!bg-green-900/20 dark:hover:!text-green-400"
                aria-label={`Revive project: ${project.name}`}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            ) : project.status !== 'Archived' && onArchive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onArchive(project)}
                className="!p-2 hover:!bg-amber-50 hover:!text-amber-700 dark:hover:!bg-amber-900/20 dark:hover:!text-amber-300"
                aria-label={`Archive project: ${project.name}`}
              >
                <Archive className="w-4 h-4" />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project)}
              className="!p-2 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-900/20 dark:hover:!text-red-400"
              aria-label={`Delete project: ${project.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}
