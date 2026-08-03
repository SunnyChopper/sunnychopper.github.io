import { Calendar, TrendingUp } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Goal } from '@/types/growth-system';
import { ProgressRing } from '@/components/atoms/ProgressRing';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { ROUTES } from '@/routes';
import {
  clampFocusGoalProgress,
  focusGoalCadenceClassName,
  focusGoalDateChipClassName,
  focusGoalFooterClassName,
  focusGoalPercentClassName,
  focusGoalProgressFillClassName,
  focusGoalProgressRingColor,
  focusGoalRowLinkClassName,
  focusGoalRowMetaClassName,
  focusGoalRowShellClassName,
  formatFocusGoalDaysLabel,
  formatFocusGoalOverdueAriaLabel,
  resolveFocusGoalUrgency,
} from '@/lib/growth-system/focus-goals-surfaces';

export interface FocusGoalRowProps {
  goal: Goal;
  progress: number;
  daysRemaining: number | null;
  animationIndex?: number;
}

export function FocusGoalRow({
  goal,
  progress,
  daysRemaining,
  animationIndex = 0,
}: FocusGoalRowProps) {
  const shouldReduceMotion = useReducedMotion();
  const clampedProgress = clampFocusGoalProgress(progress);
  const urgency = resolveFocusGoalUrgency(daysRemaining);
  const daysLabel = daysRemaining !== null ? formatFocusGoalDaysLabel(daysRemaining) : null;
  const overdueAriaLabel =
    daysRemaining !== null && daysRemaining < 0
      ? formatFocusGoalOverdueAriaLabel(daysRemaining)
      : undefined;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { delay: animationIndex * 0.08 }}
    >
      <Link
        to={`${ROUTES.admin.goals}?goalId=${goal.id}`}
        className={focusGoalRowLinkClassName}
        aria-label={`${goal.title}, ${clampedProgress}% complete${daysLabel ? `, ${daysLabel}` : ''}`}
      >
        <div className={focusGoalRowShellClassName(urgency)}>
          <motion.div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <PriorityIndicator priority={goal.priority} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {goal.title}
                </h3>
                <div className={focusGoalRowMetaClassName}>
                  <AreaBadge area={goal.area} size="sm" />
                  <span className={focusGoalCadenceClassName}>{goal.timeHorizon}</span>
                </div>
              </div>
            </div>
            <ProgressRing
              progress={clampedProgress}
              size="sm"
              color={focusGoalProgressRingColor(urgency)}
            />
          </motion.div>

          <div className="mb-2">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clampedProgress}
              aria-label={`${goal.title} progress`}
              className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
            >
              <motion.div
                initial={shouldReduceMotion ? false : { width: 0 }}
                animate={{ width: `${clampedProgress}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { delay: animationIndex * 0.08 + 0.15, duration: 0.45 }
                }
                className={`h-full rounded-full ${focusGoalProgressFillClassName(clampedProgress)}`}
              />
            </div>
          </div>

          <div className={focusGoalFooterClassName}>
            <div className={focusGoalPercentClassName}>
              <TrendingUp className="w-3.5 h-3.5" aria-hidden />
              <span>{clampedProgress}% complete</span>
            </div>
            {daysLabel !== null ? (
              <motion.div
                className={focusGoalDateChipClassName(urgency)}
                aria-label={overdueAriaLabel}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>{daysLabel}</span>
              </motion.div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
