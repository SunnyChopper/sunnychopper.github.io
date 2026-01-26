import { motion } from 'framer-motion';
import type { Project } from '@/types/growth-system';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { ProgressRing } from '@/components/atoms/ProgressRing';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ProjectSummaryDetails } from '@/components/molecules/ProjectSummaryBlocks';
import { getImpactColors } from '@/utils/project-summary';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  taskCount?: number;
  completedTaskCount?: number;
  hasHealthData?: boolean;
  isHealthLoading?: boolean;
}

export function ProjectCard({
  project,
  onClick,
  taskCount = 0,
  completedTaskCount = 0,
  hasHealthData = false,
  isHealthLoading = false,
}: ProjectCardProps) {
  const impactColors = getImpactColors(project.impact || 0);
  const progress = taskCount > 0 ? Math.round(((completedTaskCount || 0) / taskCount) * 100) : 0;

  const handleClick = () => {
    onClick(project);
  };

  return (
    <motion.div
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer text-left overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
        project.impact > 0 && impactColors.accent
      )}
      role="button"
      tabIndex={0}
      aria-label={`View project details: ${project.name}`}
    >
      {/* Impact accent border */}
      {project.impact > 0 && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1',
            impactColors.accent.replace('border-l-', 'bg-')
          )}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <PriorityIndicator priority={project.priority} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
              {project.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge status={project.status} size="sm" />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {hasHealthData ? (
            <ProgressRing progress={progress} size="sm" className="shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              --
            </div>
          )}
        </div>
      </div>
      <ProjectSummaryDetails
        project={project}
        taskCount={taskCount}
        completedTaskCount={completedTaskCount}
        hasHealthData={hasHealthData}
        isHealthLoading={isHealthLoading}
        showDescription
        descriptionClampLines={2}
      />
    </motion.div>
  );
}

export default ProjectCard;
