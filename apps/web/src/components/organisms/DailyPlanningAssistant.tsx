import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sun, CheckSquare, Repeat, TrendingUp, Sparkles, Rocket, AlertCircle } from 'lucide-react';
import { useTasks, useHabits, useMetrics } from '@/hooks/useGrowthSystem';
import type { Task, Habit, Metric, Priority } from '@/types/growth-system';
import Button from '@/components/atoms/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { usePlannerWeek } from '@/hooks/usePlanner';
import { mondayISO, todayISOLocal } from '@/lib/planner/week';
import { selectTop3TasksForToday } from '@/lib/planner/select-top3-tasks-for-today';
import { EmptyState } from '@/components/molecules/EmptyState';
import { cn } from '@/lib/utils';

interface DailyPlan {
  topTasks: Task[];
  habitsToComplete: Habit[];
  metricsToLog: Metric[];
  energyLevel: 'morning' | 'afternoon' | 'evening';
  briefing: string;
}

interface DailyPlanningAssistantProps {
  onStartDay?: () => void;
  onTopTasksChange?: (tasks: Task[]) => void;
}

const cardShellClassName =
  'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-300/60 dark:ring-blue-700/40 p-6';

const tertiaryLinkClassName =
  'text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline';

function priorityBadgeClassName(priority: Priority): string {
  switch (priority) {
    case 'P1':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    case 'P2':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    case 'P3':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    default:
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
  }
}

function buildBriefing(
  topTasksCount: number,
  habitsCount: number,
  metricsCount: number,
  capHint: string
): string {
  if (topTasksCount === 0) {
    return `No Top 3 yet — plan the day or rest.${capHint}`;
  }

  const taskLabel = topTasksCount === 1 ? 'focus task' : 'focus tasks';
  const habitLabel = habitsCount === 1 ? 'habit' : 'habits';
  const metricLabel = metricsCount === 1 ? 'metric' : 'metrics';

  return `${topTasksCount} ${taskLabel} · ${habitsCount} ${habitLabel} · ${metricsCount} ${metricLabel}${capHint}`;
}

export function DailyPlanningAssistant({
  onStartDay,
  onTopTasksChange,
}: DailyPlanningAssistantProps) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasGenerated = useRef(false);

  const { tasks, isLoading: tasksLoading, isError: tasksError } = useTasks();
  const { habits, isLoading: habitsLoading, isError: habitsError } = useHabits();
  const { metrics, isLoading: metricsLoading, isError: metricsError } = useMetrics();
  const weekStart = useMemo(() => mondayISO(new Date()), []);
  const { data: plannerWeek } = usePlannerWeek(weekStart);

  const hasNetworkError =
    (tasksError || habitsError || metricsError) &&
    !(tasksLoading || habitsLoading || metricsLoading);
  const isLoading = tasksLoading || habitsLoading || metricsLoading;

  const prevDataRef = useRef<{
    tasksLength: number;
    activeTasksCount: number;
    habitsLength: number;
    dailyHabitsCount: number;
    metricsLength: number;
    activeMetricsCount: number;
  } | null>(null);

  const generateDailyPlan = useCallback(async () => {
    const activeTasks = tasks
      .filter((t: Task) => t.status === 'Not Started' || t.status === 'In Progress')
      .filter((t: Task) => t.status !== 'Blocked');
    const dailyHabits = habits.filter((h: Habit) => h.frequency === 'Daily');
    const activeMetrics = metrics.filter((m: Metric) => m.status === 'Active');

    const currentData = {
      tasksLength: tasks.length,
      activeTasksCount: activeTasks.length,
      habitsLength: habits.length,
      dailyHabitsCount: dailyHabits.length,
      metricsLength: metrics.length,
      activeMetricsCount: activeMetrics.length,
    };

    if (
      prevDataRef.current &&
      JSON.stringify(prevDataRef.current) === JSON.stringify(currentData) &&
      hasGenerated.current
    ) {
      return;
    }

    prevDataRef.current = currentData;
    setIsGeneratingPlan(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const today = new Date();
    const hour = today.getHours();
    const todayKey = todayISOLocal();

    let energyLevel: 'morning' | 'afternoon' | 'evening';
    if (hour < 12) energyLevel = 'morning';
    else if (hour < 18) energyLevel = 'afternoon';
    else energyLevel = 'evening';

    const topTasks = selectTop3TasksForToday(tasks, plannerWeek, {
      todayKey,
      referenceDate: today,
    });

    const todayDay = plannerWeek?.days.find((d) => d.date === todayKey);

    const capHint = todayDay?.isBlocked
      ? ' · OOO today'
      : plannerWeek?.velocity
        ? ` · ~${plannerWeek.velocity.dailyCapacityStoryPoints} pts/day`
        : '';

    const briefing = buildBriefing(
      topTasks.length,
      dailyHabits.length,
      activeMetrics.length,
      capHint
    );

    setPlan({
      topTasks,
      habitsToComplete: dailyHabits,
      metricsToLog: activeMetrics.slice(0, 3),
      energyLevel,
      briefing,
    });

    onTopTasksChange?.(topTasks);

    setIsGeneratingPlan(false);
    hasGenerated.current = true;
  }, [tasks, habits, metrics, plannerWeek, onTopTasksChange]);

  useEffect(() => {
    if (!hasNetworkError || hasGenerated.current) {
      generateDailyPlan();
    }
  }, [generateDailyPlan, hasNetworkError]);

  if (hasNetworkError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to load daily plan
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Backend connection unavailable
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Please check the connection status and try again
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || isGeneratingPlan || !plan) {
    return (
      <div className={cardShellClassName} aria-busy="true">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
              <Sun className="w-6 h-6 text-blue-600/35 dark:text-blue-400/30" aria-hidden />
            </div>
            <div className="flex-1 min-w-0 space-y-2 animate-pulse">
              <div className="h-7 bg-blue-200/80 dark:bg-blue-800/50 rounded-md w-48 max-w-[85%]" />
              <div className="h-4 bg-blue-100/90 dark:bg-blue-900/45 rounded w-40 max-w-[70%]" />
            </div>
          </div>
          <div
            className="h-12 w-[8.5rem] rounded-full bg-blue-200/90 dark:bg-blue-800/50 shrink-0 animate-pulse"
            aria-hidden
          />
        </div>

        <div className="mb-4 px-1 animate-pulse">
          <div className="h-4 bg-blue-100 dark:bg-gray-700 rounded w-full max-w-md" />
        </div>

        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-gray-700 flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-[72%]" />
                <div className="flex gap-2">
                  <div className="h-5 w-9 bg-gray-200 dark:bg-gray-600 rounded" />
                  <div className="h-4 w-11 bg-gray-200 dark:bg-gray-600 rounded self-end" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cardShellClassName}>
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
            <Sun className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top 3 Tasks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plan.energyLevel === 'morning' && 'Start your day right'}
              {plan.energyLevel === 'afternoon' && 'Maintain momentum'}
              {plan.energyLevel === 'evening' && 'Finish strong'}
            </p>
          </div>
        </div>
        {onStartDay && (
          <Button
            onClick={onStartDay}
            size="lg"
            className="shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all focus-visible:ring-blue-500"
          >
            <Rocket className="w-4 h-4" />
            Start Day
          </Button>
        )}
      </div>

      <div className="mb-4 px-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
          <Sparkles
            className="w-4 h-4 text-blue-500/70 dark:text-blue-400/70 flex-shrink-0 mt-0.5"
            aria-hidden
          />
          <span>{plan.briefing}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Today
            </span>
            <div className="flex gap-3">
              <Link to={ROUTES.admin.planner} className={tertiaryLinkClassName}>
                Planner
              </Link>
              <Link to={ROUTES.admin.tasks} className={tertiaryLinkClassName}>
                View All
              </Link>
            </div>
          </div>
          {plan.topTasks.length > 0 ? (
            <div className="space-y-2">
              {plan.topTasks.map((task, idx) => {
                const isPrimary = idx === 0;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'bg-white dark:bg-gray-800 rounded-lg p-3 border flex items-start gap-3',
                      isPrimary
                        ? 'border-blue-300 dark:border-blue-700/60 shadow-sm ring-1 ring-blue-200/80 dark:ring-blue-800/40'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0',
                        isPrimary ? 'w-7 h-7 text-sm ring-2 ring-blue-500/60' : 'w-6 h-6 text-sm'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-gray-900 dark:text-white line-clamp-2',
                          isPrimary ? 'font-semibold text-base' : 'font-medium text-sm'
                        )}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded font-medium',
                            priorityBadgeClassName(task.priority)
                          )}
                        >
                          {task.priority}
                        </span>
                        {task.size ? (
                          <span className="text-xs text-gray-600 dark:text-gray-400 tabular-nums">
                            {task.size}pts
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="No Top 3 for today"
              description="Pick your focus in Planner or browse all tasks."
              actionLabel="Open Planner"
              onAction={() => navigate(ROUTES.admin.planner)}
              secondaryActionLabel="View tasks"
              onSecondaryAction={() => navigate(ROUTES.admin.tasks)}
              className="py-8"
            />
          )}
        </div>

        {isExpanded && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Habits to Complete
                </h3>
                <Link to={ROUTES.admin.habits} className={tertiaryLinkClassName}>
                  View All
                </Link>
              </div>
              {plan.habitsToComplete.length > 0 ? (
                <div className="space-y-2">
                  {plan.habitsToComplete.slice(0, 5).map((habit) => (
                    <div
                      key={habit.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <p className="flex-1 font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No daily habits configured
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Metrics to Log
                </h3>
                <Link to={ROUTES.admin.metrics} className={tertiaryLinkClassName}>
                  View All
                </Link>
              </div>
              {plan.metricsToLog.length > 0 ? (
                <div className="space-y-2">
                  {plan.metricsToLog.map((metric) => (
                    <div
                      key={metric.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    >
                      <p className="font-medium text-gray-900 dark:text-white">{metric.name}</p>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {metric.unit === 'custom' ? metric.customUnit : metric.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No active metrics
                </p>
              )}
            </div>
          </>
        )}

        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          {isExpanded ? 'Hide habits & metrics' : 'Habits & metrics'}
        </Button>
      </div>
    </div>
  );
}
