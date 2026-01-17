import { goalsService } from './goals.service';
import { metricsService } from './metrics.service';
import type {
  Goal,
  GoalProgressBreakdown,
  SuccessCriterion,
  Task,
  Metric,
  Habit,
} from '@/types/growth-system';
import { randomDelay } from '@/mocks/storage';

type HealthStatus = 'healthy' | 'at_risk' | 'behind' | 'dormant';

interface GoalHealthData {
  status: HealthStatus;
  daysRemaining: number | null;
  velocityScore: number;
  momentum: 'active' | 'dormant';
}

const DEFAULT_WEIGHTS = {
  criteriaWeight: 40,
  tasksWeight: 30,
  metricsWeight: 20,
  habitsWeight: 10,
};

export const goalProgressService = {
  async computeProgress(goalId: string): Promise<GoalProgressBreakdown> {
    await randomDelay();

    const goalResponse = await goalsService.getById(goalId);
    if (!goalResponse.success || !goalResponse.data) {
      throw new Error('Goal not found');
    }

    const goal = goalResponse.data;
    const weights = goal.progressConfig || DEFAULT_WEIGHTS;

    // Calculate criteria progress
    const criteriaProgress = this.calculateCriteriaProgress(goal.successCriteria);

    // Calculate tasks progress
    const tasksResponse = await goalsService.getLinkedTasks(goalId);
    const tasks = tasksResponse.success ? tasksResponse.data || [] : [];
    const tasksProgress = this.calculateTasksProgress(tasks);

    // Calculate metrics progress
    const metricsResponse = await goalsService.getLinkedMetrics(goalId);
    const metricLinks = metricsResponse.success ? metricsResponse.data || [] : [];
    const metricsProgress = await this.calculateMetricsProgress(metricLinks.map((m) => m.metricId));

    // Calculate habits progress
    const habitsResponse = await goalsService.getLinkedHabits(goalId);
    const habits = habitsResponse.success ? habitsResponse.data || [] : [];
    const habitsProgress = await this.calculateHabitsProgress(habits);

    // Calculate weighted overall progress
    let overall = 0;
    const totalWeight =
      weights.criteriaWeight + weights.tasksWeight + weights.metricsWeight + weights.habitsWeight;

    if (totalWeight > 0) {
      overall =
        ((criteriaProgress.percentage * weights.criteriaWeight) / 100 +
          (tasksProgress.percentage * weights.tasksWeight) / 100 +
          (metricsProgress.percentage * weights.metricsWeight) / 100 +
          (habitsProgress.consistency * weights.habitsWeight) / 100) /
        (totalWeight / 100);
    }

    return {
      overall: Math.round(overall),
      criteria: criteriaProgress,
      tasks: tasksProgress,
      metrics: metricsProgress,
      habits: habitsProgress,
    };
  },

  calculateCriteriaProgress(criteria: SuccessCriterion[] | string[]): {
    completed: number;
    total: number;
    percentage: number;
  } {
    if (criteria.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    // Handle old string format
    if (typeof criteria[0] === 'string') {
      const completed = (criteria as string[]).filter((c) => c.includes('✓')).length;
      const total = criteria.length;
      return {
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }

    // Handle new SuccessCriterion format
    const typedCriteria = criteria as SuccessCriterion[];
    const completed = typedCriteria.filter((c) => c.isCompleted).length;
    const total = typedCriteria.length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  calculateTasksProgress(tasks: Task[]): { completed: number; total: number; percentage: number } {
    if (tasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = tasks.filter((t) => t.status === 'Done').length;
    const total = tasks.length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  async calculateMetricsProgress(
    metricIds: string[]
  ): Promise<{ atTarget: number; total: number; percentage: number }> {
    if (metricIds.length === 0) {
      return { atTarget: 0, total: 0, percentage: 0 };
    }

    let atTarget = 0;

    for (const metricId of metricIds) {
      const metricResponse = await metricsService.getById(metricId);
      if (!metricResponse.success || !metricResponse.data) continue;

      const metric = metricResponse.data;
      const logsResponse = await metricsService.getHistory(metricId);

      if (!logsResponse.success || !logsResponse.data || logsResponse.data.length === 0) continue;

      const latestLog = logsResponse.data[0];
      if (this.isMetricAtTarget(latestLog.value, metric)) {
        atTarget++;
      }
    }

    const total = metricIds.length;
    return {
      atTarget,
      total,
      percentage: total > 0 ? Math.round((atTarget / total) * 100) : 0,
    };
  },

  isMetricAtTarget(value: number, metric: Metric): boolean {
    if (metric.targetValue === null) return false;

    const threshold = metric.targetValue * 0.9; // 90% of target counts as "at target"

    if (metric.direction === 'Higher') {
      return value >= threshold;
    } else if (metric.direction === 'Lower') {
      return value <= metric.targetValue * 1.1;
    } else if (metric.direction === 'Target') {
      const range = metric.targetValue * 0.1;
      return Math.abs(value - metric.targetValue) <= range;
    }

    return false;
  },

  async calculateHabitsProgress(
    habits: Habit[]
  ): Promise<{ streakDays: number; consistency: number }> {
    if (habits.length === 0) {
      return { streakDays: 0, consistency: 0 };
    }

    let totalConsistency = 0;
    let maxStreak = 0;

    // TODO: Implement actual habit progress calculation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const habit of habits) {
      // This is a simplified calculation - would need actual habit logs service
      // For now, return placeholder values
      totalConsistency += 70; // Assume 70% consistency
      maxStreak = Math.max(maxStreak, 5); // Placeholder
    }

    return {
      streakDays: maxStreak,
      consistency: habits.length > 0 ? Math.round(totalConsistency / habits.length) : 0,
    };
  },

  async calculateHealth(goal: Goal, progress: GoalProgressBreakdown): Promise<GoalHealthData> {
    await randomDelay();

    if (!goal) {
      throw new Error('Goal is required for health calculation');
    }

    const now = new Date();
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const createdDate = new Date(goal.createdAt);
    const lastActivity = goal.lastActivityAt ? new Date(goal.lastActivityAt) : createdDate;

    // Calculate days remaining
    const daysRemaining = targetDate
      ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate momentum (days since last activity)
    const daysSinceActivity = Math.ceil(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    const momentum: 'active' | 'dormant' = daysSinceActivity <= 7 ? 'active' : 'dormant';

    // Calculate velocity score (progress per day)
    const totalDays =
      Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    const velocityScore = progress.overall / totalDays;

    // Determine health status
    let status: HealthStatus = 'healthy';

    if (momentum === 'dormant') {
      status = 'dormant';
    } else if (daysRemaining !== null && targetDate) {
      const totalProjectDays = Math.ceil(
        (targetDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const expectedProgress =
        totalProjectDays > 0 ? ((totalProjectDays - daysRemaining) / totalProjectDays) * 100 : 0;

      if (progress.overall < expectedProgress - 20) {
        status = 'behind';
      } else if (progress.overall < expectedProgress - 10) {
        status = 'at_risk';
      }
    }

    return {
      status,
      daysRemaining,
      velocityScore,
      momentum,
    };
  },

  getLinkedCounts: async (
    goalId: string
  ): Promise<{ tasks: number; metrics: number; habits: number; projects: number }> => {
    await randomDelay();

    const [tasksRes, metricsRes, habitsRes, projectsRes] = await Promise.all([
      goalsService.getLinkedTasks(goalId),
      goalsService.getLinkedMetrics(goalId),
      goalsService.getLinkedHabits(goalId),
      goalsService.getLinkedProjects?.(goalId) || Promise.resolve({ data: [], success: true }),
    ]);

    return {
      tasks: tasksRes.success ? tasksRes.data?.length || 0 : 0,
      metrics: metricsRes.success ? metricsRes.data?.length || 0 : 0,
      habits: habitsRes.success ? habitsRes.data?.length || 0 : 0,
      projects: projectsRes.success ? projectsRes.data?.length || 0 : 0,
    };
  },
};
