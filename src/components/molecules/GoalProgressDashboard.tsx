import { CheckSquare, TrendingUp, BarChart3, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';
import type { GoalProgressBreakdown } from '../../types/growth-system';
import { ProgressRing } from '../atoms/ProgressRing';

interface GoalProgressDashboardProps {
  progress: GoalProgressBreakdown;
  showBreakdown?: boolean;
}

export function GoalProgressDashboard({ progress, showBreakdown = true }: GoalProgressDashboardProps) {
  const segments = [
    { 
      label: 'Criteria', 
      value: progress.criteria.percentage, 
      color: 'bg-blue-500', 
      icon: CheckSquare,
      detail: `${progress.criteria.completed}/${progress.criteria.total} completed`
    },
    { 
      label: 'Tasks', 
      value: progress.tasks.percentage, 
      color: 'bg-purple-500', 
      icon: TrendingUp,
      detail: `${progress.tasks.completed}/${progress.tasks.total} done`
    },
    { 
      label: 'Metrics', 
      value: progress.metrics.percentage, 
      color: 'bg-green-500', 
      icon: BarChart3,
      detail: `${progress.metrics.atTarget}/${progress.metrics.total} at target`
    },
    { 
      label: 'Habits', 
      value: progress.habits.consistency, 
      color: 'bg-amber-500', 
      icon: Repeat,
      detail: `${progress.habits.consistency}% consistency`
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Progress Overview
      </h3>

      {/* Overall Progress Ring */}
      <div className="flex flex-col items-center mb-8">
        <ProgressRing progress={progress.overall} size="xl" showLabel color="blue" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Overall Progress</p>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress Sources
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progress.overall}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {segments.map((segment, index) => {
            const width = segment.value > 0 ? Math.max(segment.value / 4, 2) : 0;
            return width > 0 ? (
              <motion.div
                key={segment.label}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`${segment.color} first:rounded-l-full last:rounded-r-full`}
                title={`${segment.label}: ${segment.value}%`}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Breakdown Cards */}
      {showBreakdown && (
        <div className="grid grid-cols-2 gap-3">
          {segments.map((segment, index) => {
            const Icon = segment.icon;
            return (
              <motion.div
                key={segment.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {segment.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {segment.value}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {segment.detail}
                </p>
                {/* Mini progress bar */}
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.value}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className={`h-full ${segment.color} rounded-full`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
