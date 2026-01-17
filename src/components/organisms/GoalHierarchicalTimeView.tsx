import { useState, useMemo } from 'react';
import { ChevronLeft, Plus, Home, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Goal, TimeHorizon, GoalProgressBreakdown } from '@/types/growth-system';
import { GoalCard } from '@/components/molecules/GoalCard';

interface GoalHierarchicalTimeViewProps {
  goals: Goal[];
  goalsProgress: Map<string, GoalProgressBreakdown>;
  goalsLinkedCounts: Map<
    string,
    { tasks: number; metrics: number; habits: number; projects: number }
  >;
  goalsHealth: Map<
    string,
    {
      status: 'healthy' | 'at_risk' | 'behind' | 'dormant';
      daysRemaining: number | null;
      momentum: 'active' | 'dormant';
    }
  >;
  onGoalClick: (goal: Goal) => void;
  onCreateSubgoal?: (parentGoal: Goal) => void;
}

const TIME_HORIZONS: TimeHorizon[] = ['Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'];

// Navigation can be by specific goal (drill into its children) OR by time horizon (show all goals at that horizon)
type NavigationItem = { type: 'goal'; goal: Goal } | { type: 'horizon'; horizon: TimeHorizon };

export function GoalHierarchicalTimeView({
  goals,
  goalsProgress,
  goalsLinkedCounts,
  goalsHealth,
  onGoalClick,
  onCreateSubgoal,
}: GoalHierarchicalTimeViewProps) {
  // Track navigation history for breadcrumb trail
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);

  // Get child count for a goal (explicit children via parentGoalId)
  const getChildCount = (goalId: string): number => {
    return goals.filter((g) => g.parentGoalId === goalId).length;
  };

  // Get subgoal counts by horizon (explicit children only)
  const getSubgoalCounts = (goalId: string) => {
    const children = goals.filter((g) => g.parentGoalId === goalId);
    const counts: Partial<Record<TimeHorizon, number>> = {};

    children.forEach((child) => {
      counts[child.timeHorizon] = (counts[child.timeHorizon] || 0) + 1;
    });

    return counts;
  };

  // Get the next time horizon level
  const getNextHorizon = (currentHorizon: TimeHorizon): TimeHorizon | null => {
    const currentIndex = TIME_HORIZONS.indexOf(currentHorizon);
    return currentIndex < TIME_HORIZONS.length - 1 ? TIME_HORIZONS[currentIndex + 1] : null;
  };

  // Get count of goals at the next time horizon
  const getNextHorizonCount = (currentHorizon: TimeHorizon): number => {
    const nextHorizon = getNextHorizon(currentHorizon);
    if (!nextHorizon) return 0;
    return goals.filter((g) => g.timeHorizon === nextHorizon).length;
  };

  // Zoom into a goal (drill down by explicit children OR by time horizon)
  const handleZoomInto = (goal: Goal) => {
    const explicitChildCount = getChildCount(goal.id);

    if (explicitChildCount > 0) {
      // Has explicit children - drill into those
      setNavigationStack((prev) => [...prev, { type: 'goal', goal }]);
    } else {
      // No explicit children - check if we can drill into next time horizon
      const nextHorizon = getNextHorizon(goal.timeHorizon);
      const nextHorizonGoalCount = nextHorizon
        ? goals.filter((g) => g.timeHorizon === nextHorizon).length
        : 0;

      if (nextHorizonGoalCount > 0) {
        // Drill into next time horizon
        setNavigationStack((prev) => [
          ...prev,
          { type: 'goal', goal },
          { type: 'horizon', horizon: nextHorizon! },
        ]);
      } else {
        // No children and no next horizon - open detail view
        onGoalClick(goal);
      }
    }
  };

  // Navigate back one level
  const handleNavigateBack = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
  };

  // Navigate to a specific level in breadcrumb
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Go to root
      setNavigationStack([]);
    } else {
      setNavigationStack((prev) => prev.slice(0, index + 1));
    }
  };

  // Get goals to display at current level
  const currentLevelGoals = useMemo(() => {
    if (navigationStack.length === 0) {
      // Root level - show only goals at the top-most time horizon
      // Find the first time horizon that has goals without parents
      for (const horizon of TIME_HORIZONS) {
        const horizonGoals = goals.filter((g) => g.timeHorizon === horizon && !g.parentGoalId);
        if (horizonGoals.length > 0) {
          return horizonGoals;
        }
      }
      return [];
    }

    const lastNav = navigationStack[navigationStack.length - 1];

    if (lastNav.type === 'goal') {
      // Showing children of a specific goal
      return goals.filter((g) => g.parentGoalId === lastNav.goal.id);
    } else {
      // Showing all goals at a specific time horizon
      return goals.filter((g) => g.timeHorizon === lastNav.horizon && !g.parentGoalId);
    }
  }, [goals, navigationStack]);

  // Group by time horizon
  const groupedGoals = useMemo(() => {
    return TIME_HORIZONS.reduce(
      (acc, horizon) => {
        acc[horizon] = currentLevelGoals.filter((g) => g.timeHorizon === horizon);
        return acc;
      },
      {} as Record<TimeHorizon, Goal[]>
    );
  }, [currentLevelGoals]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div
        className={`rounded-lg p-4 border-2 transition-colors ${
          navigationStack.length > 0
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              navigationStack.length === 0
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700'
            }`}
            title="Go to root"
          >
            <Home className="w-4 h-4" />
            <span>All Goals</span>
          </button>

          {navigationStack.map((navItem, index) => {
            const isLast = index === navigationStack.length - 1;
            const label = navItem.type === 'goal' ? navItem.goal.title : `${navItem.horizon} Goals`;

            return (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isLast
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700'
                  }`}
                >
                  {navItem.type === 'horizon' && (
                    <span className="text-xs mr-1 opacity-70">[{navItem.horizon}]</span>
                  )}
                  {label}
                </button>
              </div>
            );
          })}

          {navigationStack.length > 0 && (
            <button
              onClick={handleNavigateBack}
              className="ml-auto flex items-center gap-1 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-blue-300 dark:border-blue-700 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Current Context Info */}
        {navigationStack.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
            {(() => {
              const lastNav = navigationStack[navigationStack.length - 1];
              if (lastNav.type === 'goal') {
                const explicitChildCount = getChildCount(lastNav.goal.id);
                if (explicitChildCount > 0) {
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        📂 Viewing subgoals of:
                      </span>
                      <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm font-semibold">
                        {lastNav.goal.timeHorizon}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {lastNav.goal.title}
                      </span>
                    </div>
                  );
                }
              } else if (lastNav.type === 'horizon') {
                return (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      📊 Showing all {lastNav.horizon.toLowerCase()} goals
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>

      {/* Goals at Current Level */}
      {currentLevelGoals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {(() => {
              if (navigationStack.length === 0) return 'No goals found at this level';
              const lastNav = navigationStack[navigationStack.length - 1];
              if (lastNav.type === 'goal') {
                return `No subgoals found for "${lastNav.goal.title}"`;
              } else {
                return `No ${lastNav.horizon.toLowerCase()} goals found`;
              }
            })()}
          </p>
          {(() => {
            if (!onCreateSubgoal || navigationStack.length === 0) return null;
            const lastNav = navigationStack[navigationStack.length - 1];
            if (lastNav.type === 'goal') {
              return (
                <button
                  onClick={() => onCreateSubgoal(lastNav.goal)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Subgoal
                </button>
              );
            }
            return null;
          })()}
        </div>
      ) : (
        <div className="space-y-8">
          {TIME_HORIZONS.map((horizon) => {
            const horizonGoals = groupedGoals[horizon];
            if (horizonGoals.length === 0) return null;

            return (
              <div key={horizon}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                    {horizon}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({horizonGoals.length} {horizonGoals.length === 1 ? 'goal' : 'goals'})
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {horizonGoals.map((goal) => {
                    const progress = goalsProgress.get(goal.id);
                    const linkedCounts = goalsLinkedCounts.get(goal.id);
                    const health = goalsHealth.get(goal.id);
                    const explicitChildCount = getChildCount(goal.id);
                    const subgoalCounts = getSubgoalCounts(goal.id);
                    const nextHorizon = getNextHorizon(goal.timeHorizon);
                    const nextHorizonCount = getNextHorizonCount(goal.timeHorizon);

                    // Can drill down if has explicit children OR there are goals in the next horizon
                    const canDrillDown = explicitChildCount > 0 || nextHorizonCount > 0;

                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative group">
                          {/* Wrapper for drill-down if can drill */}
                          {canDrillDown ? (
                            <div>
                              {/* Overlay indicator for drill-down */}
                              <div className="absolute -inset-0.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-blue-500/50 dark:border-blue-400/50" />

                              {/* Click to drill down */}
                              <div
                                onClick={() => handleZoomInto(goal)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleZoomInto(goal);
                                  }
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Zoom into goal: ${goal.title}`}
                                className="cursor-pointer relative"
                              >
                                <GoalCard
                                  goal={goal}
                                  onClick={() => {}} // Prevent default card click
                                  progress={progress}
                                  linkedCounts={linkedCounts}
                                  healthStatus={health?.status}
                                  daysRemaining={health?.daysRemaining}
                                  momentum={health?.momentum}
                                />

                                {/* Zoom indicator badge on card */}
                                <div className="absolute top-3 right-3 bg-blue-600 dark:bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span>Zoom In</span>
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </div>

                              {/* Subgoal indicator */}
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <button
                                  onClick={() => handleZoomInto(goal)}
                                  className="flex-1 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/40 rounded-lg transition-all border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow"
                                >
                                  <span className="font-semibold">
                                    {explicitChildCount > 0 ? (
                                      <>
                                        {explicitChildCount}{' '}
                                        {explicitChildCount === 1 ? 'subgoal' : 'subgoals'}
                                        {Object.keys(subgoalCounts).length > 0 && (
                                          <span className="text-xs ml-2 font-normal">
                                            (
                                            {Object.entries(subgoalCounts)
                                              .map(([h, c]) => `${c} ${h.toLowerCase()}`)
                                              .join(', ')}
                                            )
                                          </span>
                                        )}
                                      </>
                                    ) : nextHorizon && nextHorizonCount > 0 ? (
                                      <>
                                        View {nextHorizonCount} {nextHorizon.toLowerCase()}{' '}
                                        {nextHorizonCount === 1 ? 'goal' : 'goals'}
                                      </>
                                    ) : null}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs">View</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </button>
                                {onCreateSubgoal && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateSubgoal(goal);
                                    }}
                                    className="px-3 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                    title="Add subgoal"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <GoalCard
                              goal={goal}
                              onClick={onGoalClick}
                              progress={progress}
                              linkedCounts={linkedCounts}
                              healthStatus={health?.status}
                              daysRemaining={health?.daysRemaining}
                              momentum={health?.momentum}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
