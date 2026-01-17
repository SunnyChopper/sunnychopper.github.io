import { Calendar, Target, TrendingUp } from 'lucide-react';
import type { Project } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { ProgressRing } from '../atoms/ProgressRing';
import { SUBCATEGORY_LABELS } from '../../constants/growth-system';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  taskCount?: number;
  completedTaskCount?: number;
  goalCount?: number;
}

const STATUS_COLORS: Record<Project['status'], string> = {
  Planning: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  Active: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Cancelled: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
};

export function ProjectCard({
  project,
  onClick,
  taskCount = 0,
  completedTaskCount = 0,
  goalCount = 0,
}: ProjectCardProps) {
  const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const startDate = formatDate(project.startDate);
  const endDate = formatDate(project.endDate);

  return (
    <button
      onClick={() => onClick(project)}
      className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700 text-left"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PriorityIndicator priority={project.priority} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate mb-1">
              {project.name}
            </h3>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}
            >
              {project.status}
            </span>
          </div>
        </div>
        <ProgressRing progress={progress} size="lg" />
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AreaBadge area={project.area} />
        {project.subCategory && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {SUBCATEGORY_LABELS[project.subCategory]}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {(startDate || endDate) && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {goalCount > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Target className="w-4 h-4" />
              <span>{goalCount}</span>
            </div>
          )}
          {taskCount > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span>
                {completedTaskCount}/{taskCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {project.impact > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Impact Score</span>
            <span className="font-semibold text-gray-900 dark:text-white">{project.impact}/10</span>
          </div>
        </div>
      )}
    </button>
  );
}

export default ProjectCard;
