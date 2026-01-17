import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type { Metric, MetricLog, MetricMilestone } from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';
import { calculateProgress, calculateStreaks, getTrendData } from '../../utils/metric-analytics';
import { walletService } from '../rewards/wallet.service';

const USER_ID = 'user-1';

// Milestone point values
const MILESTONE_POINTS = {
  target_reached: { base: 200, multiplier: 1.5 }, // Base 200, multiplied by target difficulty
  streak_7: 350,
  streak_30: 1500,
  streak_100: 5000,
  improvement_10: 200,
  improvement_25: 500,
  improvement_50: 1000,
  consistency_7: 175,
  consistency_30: 750,
};

export const metricMilestonesService = {
  /**
   * Detect milestones for a metric
   */
  async detectMilestones(
    metric: Metric,
    logs: MetricLog[]
  ): Promise<ApiResponse<MetricMilestone[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const existingMilestones = await storage.getAll<MetricMilestone>('metricMilestones');
    const existingForMetric = existingMilestones.filter((m) => m.metricId === metric.id);

    const newMilestones: MetricMilestone[] = [];

    if (logs.length === 0) {
      return { data: [], success: true };
    }

    const latestLog = logs[0];
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );

    // Check target reached
    if (metric.targetValue) {
      const progress = calculateProgress(latestLog.value, metric.targetValue, metric.direction);

      const hasTargetMilestone = existingForMetric.some(
        (m) => m.type === 'target_reached' && Math.abs(m.value - metric.targetValue) < 0.01
      );

      if (progress.percentage >= 100 && !hasTargetMilestone) {
        const points = Math.round(
          MILESTONE_POINTS.target_reached.base *
            (metric.targetValue > 100 ? 1.5 : metric.targetValue > 50 ? 1.2 : 1.0)
        );

        const milestone: MetricMilestone = {
          id: generateId(),
          metricId: metric.id,
          type: 'target_reached',
          value: metric.targetValue,
          achievedAt: latestLog.loggedAt,
          pointsAwarded: points,
          rewardId: null,
        };

        newMilestones.push(milestone);
      }
    }

    // Check streak milestones
    const streaks = calculateStreaks(logs);
    const streakMilestones = [
      { days: 7, type: 'streak' as const, points: MILESTONE_POINTS.streak_7 },
      { days: 30, type: 'streak' as const, points: MILESTONE_POINTS.streak_30 },
      { days: 100, type: 'streak' as const, points: MILESTONE_POINTS.streak_100 },
    ];

    for (const { days, type, points } of streakMilestones) {
      const hasStreakMilestone = existingForMetric.some(
        (m) => m.type === type && Math.abs(m.value - days) < 1
      );

      if (streaks.current >= days && !hasStreakMilestone) {
        const milestone: MetricMilestone = {
          id: generateId(),
          metricId: metric.id,
          type,
          value: days,
          achievedAt: latestLog.loggedAt,
          pointsAwarded: points,
          rewardId: null,
        };

        newMilestones.push(milestone);
      }
    }

    // Check improvement milestones
    if (sortedLogs.length >= 2) {
      const firstValue = sortedLogs[0].value;
      const lastValue = sortedLogs[sortedLogs.length - 1].value;
      const improvement = ((lastValue - firstValue) / firstValue) * 100;

      const improvementMilestones = [
        { percent: 10, points: MILESTONE_POINTS.improvement_10 },
        { percent: 25, points: MILESTONE_POINTS.improvement_25 },
        { percent: 50, points: MILESTONE_POINTS.improvement_50 },
      ];

      for (const { percent, points } of improvementMilestones) {
        const hasImprovementMilestone = existingForMetric.some(
          (m) => m.type === 'improvement' && Math.abs(m.value - percent) < 1
        );

        if (improvement >= percent && !hasImprovementMilestone) {
          const milestone: MetricMilestone = {
            id: generateId(),
            metricId: metric.id,
            type: 'improvement',
            value: percent,
            achievedAt: latestLog.loggedAt,
            pointsAwarded: points,
            rewardId: null,
          };

          newMilestones.push(milestone);
        }
      }
    }

    // Check consistency milestones (logging frequency)
    const consistencyDays = [7, 30];
    for (const days of consistencyDays) {
      const recentLogs = logs.filter((log) => {
        const logDate = new Date(log.loggedAt);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return logDate >= cutoffDate;
      });

      const uniqueDates = new Set(
        recentLogs.map((log) => new Date(log.loggedAt).toISOString().split('T')[0])
      );

      const hasConsistencyMilestone = existingForMetric.some(
        (m) => m.type === 'consistency' && Math.abs(m.value - days) < 1
      );

      if (uniqueDates.size >= days && !hasConsistencyMilestone) {
        const points =
          days === 7 ? MILESTONE_POINTS.consistency_7 : MILESTONE_POINTS.consistency_30;

        const milestone: MetricMilestone = {
          id: generateId(),
          metricId: metric.id,
          type: 'consistency',
          value: days,
          achievedAt: latestLog.loggedAt,
          pointsAwarded: points,
          rewardId: null,
        };

        newMilestones.push(milestone);
      }
    }

    // Save and award points for new milestones
    for (const milestone of newMilestones) {
      await storage.create('metricMilestones', milestone.id, milestone);
      await this.awardPoints(milestone);
    }

    return {
      data: newMilestones,
      success: true,
    };
  },

  /**
   * Award points for a milestone
   */
  async awardPoints(milestone: MetricMilestone): Promise<ApiResponse<void>> {
    try {
      await walletService.addPoints(
        milestone.pointsAwarded,
        'manual',
        `Milestone achieved: ${milestone.type} for metric`,
        null,
        milestone.metricId
      );

      return {
        data: undefined,
        success: true,
      };
    } catch (error) {
      console.error('Failed to award points:', error);
      return {
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to award points',
        success: false,
      };
    }
  },

  /**
   * Get all milestones for a metric
   */
  async getMilestones(metricId: string): Promise<ApiListResponse<MetricMilestone>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allMilestones = await storage.getAll<MetricMilestone>('metricMilestones');
    const milestones = allMilestones
      .filter((m) => m.metricId === metricId)
      .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime());

    return {
      data: milestones,
      total: milestones.length,
      success: true,
    };
  },

  /**
   * Get all milestones for user
   */
  async getAllMilestones(): Promise<ApiListResponse<MetricMilestone>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const milestones = await storage.getAll<MetricMilestone>('metricMilestones');

    return {
      data: milestones.sort(
        (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
      ),
      total: milestones.length,
      success: true,
    };
  },
};
