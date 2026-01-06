import { Target, Calendar, TrendingUp } from 'lucide-react';
import type { Goal } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { StatusBadge } from '../atoms/StatusBadge';
import { PriorityIndicator } from '../atoms/PriorityIndicator';
import { ProgressRing } from '../atoms/ProgressRing';
import { SUBCATEGORY_LABELS } from '../../constants/growth-system';

interface GoalCardProps {
  goal: Goal;
  onClick: (goal: Goal) => void;
  progress?: number;
}

export function GoalCard({ goal, onClick, progress = 0 }: GoalCardProps) {

  const completedCriteria = goal.successCriteria.filter(c => c.includes('✓')).length;
  const totalCriteria = goal.successCriteria.length;
  const criteriaProgress = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : progress;

  return (
    <div
      onClick={() => onClick(goal)}
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <PriorityIndicator priority={goal.priority} size="md" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {goal.timeHorizon}
              </span>
            </div>
          </div>
        </div>
        <ProgressRing progress={criteriaProgress} size="md" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
        {goal.title}
      </h3>

      {goal.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {goal.description}
        </p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <AreaBadge area={goal.area} />
        {goal.subCategory && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {SUBCATEGORY_LABELS[goal.subCategory]}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <StatusBadge status={goal.status} size="sm" />

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {totalCriteria > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{completedCriteria}/{totalCriteria} criteria</span>
            </div>
          )}
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
