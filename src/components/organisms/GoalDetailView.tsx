import { useState, useEffect, useMemo, useRef } from 'react';
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

  // Use refs to store latest values for use in effect without causing re-renders
  const latestValuesRef = useRef({ goal, tasks, metrics, habits });
  latestValuesRef.current = { goal, tasks, metrics, habits };

  // Create stable ID arrays for dependency tracking to avoid infinite loops
  const taskIds = useMemo(
    () =>
      tasks
        .map((t) => t.id)
        .sort()
        .join(','),
    [tasks]
  );
  const metricIds = useMemo(
    () =>
      metrics
        .map((m) => m.metric.id)
        .sort()
        .join(','),
    [metrics]
  );
  const habitIds = useMemo(
    () =>
      habits
        .map((h) => h.habit.id)
        .sort()
        .join(','),
    [habits]
  );
  const successCriteriaHash = useMemo(() => {
    if (!goal.successCriteria || goal.successCriteria.length === 0) return '';
    return JSON.stringify(
      goal.successCriteria.map((c): { id: string; isCompleted: boolean } => {
        if (typeof c === 'string') {
          const str = c as string;
          return { id: str, isCompleted: str.includes('✓') };
        }
        const criterion = c as { id: string; isCompleted: boolean };
        return { id: criterion.id, isCompleted: criterion.isCompleted };
      })
    );
  }, [goal.successCriteria]);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoadingProgress(true);
      try {
        // Get latest values from ref to ensure we use current props
        const {
          goal: currentGoal,
          tasks: currentTasks,
          metrics: currentMetrics,
          habits: currentHabits,
        } = latestValuesRef.current;

        // Pass goal object and tasks, metrics, and habits to avoid API calls - they're already filtered from cache
        const metricsArray = currentMetrics.map((m) => m.metric);
        const habitsArray = currentHabits.map((h) => h.habit);
        const progressData = await goalProgressService.computeProgress(
          currentGoal,
          currentTasks,
          metricsArray,
          habitsArray
        );
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to compute progress:', error);
        // Fallback to basic criteria-based progress
        const { goal: currentGoal } = latestValuesRef.current;
        const criteriaProgress = goalProgressService.calculateCriteriaProgress(
          currentGoal.successCriteria
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
  }, [goal.id, successCriteriaHash, taskIds, metricIds, habitIds]);

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
        {isLoadingProgress ? (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading progress overview...</p>
            </div>
          </div>
        ) : progress ? (
          <div className="mb-6">
            <GoalProgressDashboard progress={progress} showBreakdown={true} />
          </div>
        ) : null}

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

          {/* Projects Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Projects ({projects.length})
            </h3>
            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.title}
                      </p>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No projects linked</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Link projects that contribute to achieving this goal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
