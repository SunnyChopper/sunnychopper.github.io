import type {
  Area,
  SubCategory,
  Priority,
  TaskStatus,
  GoalStatus,
  ProjectStatus,
  TimeHorizon,
  HabitType,
  HabitFrequency,
  MetricUnit,
  MetricDirection,
  MetricSource,
  MetricStatus,
} from '../types/growth-system';

export const AREAS: readonly Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'];

export const SUBCATEGORIES_BY_AREA: Record<Area, readonly SubCategory[]> = {
  Health: ['Physical', 'Mental', 'Spiritual', 'Nutrition', 'Sleep', 'Exercise'],
  Wealth: ['Income', 'Expenses', 'Investments', 'Debt', 'NetWorth'],
  Love: ['Romantic', 'Family', 'Friends', 'Social'],
  Happiness: ['Joy', 'Gratitude', 'Purpose', 'Peace'],
  Operations: ['Productivity', 'Organization', 'Systems', 'Habits'],
  DayJob: ['Career', 'Skills', 'Projects', 'Performance'],
};

export const PRIORITIES: readonly Priority[] = ['P1', 'P2', 'P3', 'P4'];

export const TASK_STATUSES: readonly TaskStatus[] = ['NotStarted', 'InProgress', 'Blocked', 'OnHold', 'Done', 'Cancelled'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Blocked: 'Blocked',
  OnHold: 'On Hold',
  Done: 'Done',
  Cancelled: 'Cancelled',
};

export const GOAL_TIME_HORIZONS: readonly TimeHorizon[] = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];
export const GOAL_STATUSES: readonly GoalStatus[] = ['Planning', 'Active', 'OnTrack', 'AtRisk', 'Achieved', 'Abandoned'];

export const PROJECT_STATUSES: readonly ProjectStatus[] = ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'];

export const HABIT_TYPES: readonly HabitType[] = ['Build', 'Maintain', 'Reduce', 'Quit'];
export const HABIT_FREQUENCIES: readonly HabitFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Custom'];

export const METRIC_UNITS: readonly MetricUnit[] = [
  'count',
  'hours',
  'minutes',
  'dollars',
  'pounds',
  'kg',
  'percent',
  'rating',
  'custom',
];
export const METRIC_DIRECTIONS: readonly MetricDirection[] = ['Higher', 'Lower', 'Target'];
export const METRIC_SOURCES: readonly MetricSource[] = ['Manual', 'App', 'Device'];
export const METRIC_STATUSES: readonly MetricStatus[] = ['Active', 'Paused', 'Archived'];


