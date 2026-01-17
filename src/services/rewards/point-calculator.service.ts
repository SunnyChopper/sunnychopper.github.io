import type { Task, Area, Priority } from '../../types/growth-system';
import type { TaskPointValuation } from '../../types/rewards';

const BASE_POINTS_PER_MINUTE = 10;

const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
  P1: 2.0,
  P2: 1.5,
  P3: 1.2,
  P4: 1.0,
};

const AREA_MULTIPLIERS: Record<Area, number> = {
  Health: 1.3,
  Wealth: 1.2,
  Love: 1.2,
  Happiness: 1.1,
  Operations: 1.0,
  DayJob: 1.1,
};

export const pointCalculatorService = {
  calculateTaskPoints(task: Task): TaskPointValuation {
    const size = task.size || 30;

    const basePoints = size * BASE_POINTS_PER_MINUTE;

    const priorityMultiplier = PRIORITY_MULTIPLIERS[task.priority];

    const areaMultiplier = AREA_MULTIPLIERS[task.area];

    const sizeMultiplier = size >= 120 ? 1.5 : size >= 60 ? 1.2 : 1.0;

    const totalPoints = Math.round(
      basePoints * priorityMultiplier * areaMultiplier * sizeMultiplier
    );

    return {
      taskId: task.id,
      basePoints,
      sizeMultiplier,
      priorityMultiplier,
      areaMultiplier,
      totalPoints,
      calculatedAt: new Date().toISOString(),
    };
  },

  getBasePointsPerMinute(): number {
    return BASE_POINTS_PER_MINUTE;
  },

  getPriorityMultiplier(priority: Priority): number {
    return PRIORITY_MULTIPLIERS[priority];
  },

  getAreaMultiplier(area: Area): number {
    return AREA_MULTIPLIERS[area];
  },

  calculateMetricMilestonePoints(
    milestoneType: 'target_reached' | 'streak' | 'improvement' | 'consistency',
    value: number,
    targetValue?: number | null
  ): number {
    switch (milestoneType) {
      case 'target_reached':
        if (!targetValue) return 0;
        // Base 200, multiplied by target difficulty
        const multiplier = targetValue > 100 ? 1.5 : targetValue > 50 ? 1.2 : 1.0;
        return Math.round(200 * multiplier);
      case 'streak':
        if (value === 7) return 350;
        if (value === 30) return 1500;
        if (value === 100) return 5000;
        // 50 points per day for other streaks
        return Math.round(value * 50);
      case 'improvement':
        if (value >= 50) return 1000;
        if (value >= 25) return 500;
        if (value >= 10) return 200;
        return 0;
      case 'consistency':
        if (value === 7) return 175;
        if (value === 30) return 750;
        // 25 points per day for other consistency
        return Math.round(value * 25);
      default:
        return 0;
    }
  },
};
