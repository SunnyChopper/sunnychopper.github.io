import { Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Goal } from '@/types/growth-system';
import { FocusGoalRow } from '@/components/molecules/FocusGoalRow';
import { ROUTES } from '@/routes';
import {
  focusGoalEmptyCopyClassName,
  focusGoalEmptyCtaClassName,
  focusGoalsCardShellClassName,
  focusGoalsHeaderClassName,
  focusGoalsListClassName,
  focusGoalsListMinHeightStyle,
  focusGoalsTitleClassName,
  focusGoalsViewAllLinkClassName,
} from '@/lib/growth-system/focus-goals-surfaces';

const TIMEFRAME_RANK: Record<Goal['timeHorizon'], number> = {
  Daily: 0,
  Weekly: 1,
  Monthly: 2,
  Quarterly: 3,
  Yearly: 4,
};

interface GoalWithProgress {
  goal: Goal;
  progress: number;
  daysRemaining: number | null;
}

interface GoalsDashboardWidgetProps {
  goals: Goal[];
  goalsProgress: Map<string, number>;
  className?: string;
  /** Shows skeleton goal rows instead of empty state while dashboard data loads */
  isLoading?: boolean;
}

function selectFocusGoalsForDashboard(
  goals: Goal[],
  goalsProgress: Map<string, number>
): GoalWithProgress[] {
  const activeGoalsAll = goals.filter((g) => g.status === 'Active');
  const lowestTimeframe =
    activeGoalsAll.length > 0
      ? activeGoalsAll.reduce(
          (lowest, g) =>
            TIMEFRAME_RANK[g.timeHorizon] < TIMEFRAME_RANK[lowest] ? g.timeHorizon : lowest,
          activeGoalsAll[0].timeHorizon
        )
      : null;

  const activeGoals = activeGoalsAll
    .filter((g) => g.timeHorizon === lowestTimeframe)
    .sort((a, b) => {
      const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      const progressA = goalsProgress.get(a.id) || 0;
      const progressB = goalsProgress.get(b.id) || 0;
      return progressA - progressB;
    })
    .slice(0, 3);

  return activeGoals.map((goal) => {
    const progress = goalsProgress.get(goal.id) || 0;
    const daysRemaining = goal.targetDate
      ? Math.ceil(
          (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return { goal, progress, daysRemaining };
  });
}

function FocusGoalsHeader() {
  return (
    <motion.div className={focusGoalsHeaderClassName}>
      <h2 className={focusGoalsTitleClassName}>
        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden />
        Focus Goals
      </h2>
      <Link
        to={ROUTES.admin.goals}
        className={focusGoalsViewAllLinkClassName}
        aria-label="View all goals"
      >
        View all
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
    </motion.div>
  );
}

function FocusGoalsListShell({
  children,
  'aria-busy': ariaBusy,
}: {
  children: ReactNode;
  'aria-busy'?: boolean;
}) {
  return (
    <motion.div
      className={focusGoalsListClassName}
      style={focusGoalsListMinHeightStyle}
      aria-busy={ariaBusy}
    >
      {children}
    </motion.div>
  );
}

function FocusGoalRowSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      key={index}
      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[140px] flex flex-col animate-pulse"
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <motion.div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <motion.div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-[78%]" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-14 bg-gray-200 dark:bg-gray-600 rounded-md" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
          </div>
        </motion.div>
        <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-600 shrink-0" />
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mb-2" />
      <div className="flex items-center justify-between mt-auto pt-1 gap-4">
        <div className="h-3 w-28 bg-gray-200 dark:bg-gray-600 rounded" />
        <motion.div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded-full shrink-0" />
      </div>
    </motion.div>
  );
}

export function GoalsDashboardWidget({
  goals,
  goalsProgress,
  className = '',
  isLoading = false,
}: GoalsDashboardWidgetProps) {
  const shellClassName = `${focusGoalsCardShellClassName} ${className}`.trim();

  if (isLoading) {
    return (
      <motion.div className={shellClassName} aria-busy="true">
        <FocusGoalsHeader />
        <FocusGoalsListShell aria-busy>
          {[1, 2, 3].map((i) => (
            <FocusGoalRowSkeleton key={i} index={i} />
          ))}
        </FocusGoalsListShell>
      </motion.div>
    );
  }

  const goalsWithData = selectFocusGoalsForDashboard(goals, goalsProgress);

  if (goalsWithData.length === 0) {
    return (
      <motion.div className={shellClassName}>
        <FocusGoalsHeader />
        <FocusGoalsListShell>
          <motion.div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
            <p className={focusGoalEmptyCopyClassName}>No active goals in this horizon yet.</p>
            <Link to={ROUTES.admin.goals} className="w-full max-w-xs">
              <motion.button type="button" className={focusGoalEmptyCtaClassName}>
                Create goal
              </motion.button>
            </Link>
          </motion.div>
        </FocusGoalsListShell>
      </motion.div>
    );
  }

  return (
    <motion.div className={shellClassName}>
      <FocusGoalsHeader />
      <FocusGoalsListShell>
        {goalsWithData.map((item, index) => (
          <FocusGoalRow
            key={item.goal.id}
            goal={item.goal}
            progress={item.progress}
            daysRemaining={item.daysRemaining}
            animationIndex={index}
          />
        ))}
      </FocusGoalsListShell>
    </motion.div>
  );
}
