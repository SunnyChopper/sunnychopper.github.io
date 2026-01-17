import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import type {
  Goal,
  Task,
  Metric,
  MetricLog,
  Habit,
  EntitySummary,
  GoalProgressBreakdown,
} from '@/types/growth-system';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import Button from '@/components/atoms/Button';
import { GoalProgressDashboard } from '@/components/molecules/GoalProgressDashboard';
import { GoalTasksSection } from '@/components/molecules/GoalTasksSection';
import { GoalMetricsSection } from '@/components/molecules/GoalMetricsSection';
import { GoalHabitsSection } from '@/components/molecules/GoalHabitsSection';
import { SuccessCriteriaList } from '@/components/molecules/SuccessCriteriaList';
import { SUBCATEGORY_LABELS } from '@/constants/growth-system';
import { goalProgressService } from '@/services/growth-system/goal-progress.service';

interface MetricWithLogs {
  metric: Metric;
  latestLog: MetricLog | null;
  progress: number;
}

interface HabitWithStreak {
  habit: Habit;
  currentStreak: number;
  completedToday: boolean;
  weeklyProgress: number;
}

interface GoalDetailViewProps {
  goal: Goal;
  tasks: Task[];
  metrics: MetricWithLogs[];
  habits: HabitWithStreak[];
  projects: EntitySummary[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCriterion?: (criterionId: string, isCompleted: boolean) => void;
  onUpdateCriterion?: (criterionId: string, updates: any) => void;
  onAddTask?: () => void;
  onLinkMetric?: () => void;
  onLinkHabit?: () => void;
  onCompleteHabit?: (habitId: string) => void;
  onLogMetric?: (metricId: string) => void;
}

export function GoalDetailView({
  goal,
  tasks,
  metrics,
  habits,
  projects,
  onBack,
  onEdit,
  onDelete,
  onToggleCriterion,
  onUpdateCriterion,
  onAddTask,
  onLinkMetric,
  onLinkHabit,
  onCompleteHabit,
  onLogMetric,
}: GoalDetailViewProps) {
  const [progress, setProgress] = useState<GoalProgressBreakdown | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoadingProgress(true);
      try {
        const progressData = await goalProgressService.computeProgress(goal.id);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to compute progress:', error);
        // Fallback to basic criteria-based progress
        const criteriaProgress = goalProgressService.calculateCriteriaProgress(
          goal.successCriteria
        );
        setProgress({
          overall: criteriaProgress.percentage,
          criteria: criteriaProgress,
          tasks: { completed: 0, total: 0, percentage: 0 },
          metrics: { atTarget: 0, total: 0, percentage: 0 },
          habits: { streakDays: 0, consistency: 0 },
        });
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadProgress();
  }, [goal.id, goal.successCriteria]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Goals
        </button>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <PriorityIndicator priority={goal.priority} size="lg" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{goal.title}</h1>
              </div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <AreaBadge area={goal.area} />
                {goal.subCategory && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {SUBCATEGORY_LABELS[goal.subCategory]}
                  </span>
                )}
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {goal.timeHorizon}
                </span>
                <StatusBadge status={goal.status} size="sm" />
              </div>
              {goal.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">{goal.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDelete}
                className="hover:!bg-red-50 hover:!text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {goal.targetDate && (
            <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target Date</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(goal.targetDate).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Success Criteria */}
          {goal.successCriteria && goal.successCriteria.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Success Criteria
              </h3>
              <SuccessCriteriaList
                criteria={goal.successCriteria as any}
                onToggleComplete={onToggleCriterion}
                onUpdateCriterion={onUpdateCriterion}
                editable={true}
              />
            </div>
          )}

          {goal.notes && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {goal.notes}
              </p>
            </div>
          )}
        </div>

        {/* Progress Dashboard */}
        {!isLoadingProgress && progress && (
          <div className="mb-6">
            <GoalProgressDashboard progress={progress} showBreakdown={true} />
          </div>
        )}

        {/* Entity Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Section */}
          <GoalTasksSection tasks={tasks} onAddTask={onAddTask} showEmpty={true} />

          {/* Metrics Section */}
          <GoalMetricsSection
            metrics={metrics}
            onLinkMetric={onLinkMetric}
            onLogMetric={onLogMetric}
            showEmpty={true}
          />

          {/* Habits Section */}
          <GoalHabitsSection
            habits={habits}
            onLinkHabit={onLinkHabit}
            onCompleteHabit={onCompleteHabit}
            showEmpty={true}
          />

          {/* Projects Section - Placeholder for now */}
          {projects.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Projects ({projects.length})
              </h3>
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
