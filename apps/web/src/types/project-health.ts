/** Matches backend `ProjectHealthMetrics` (camelCase wire). */
export interface ProjectHealthMetrics {
  healthScore: number;
  progressScore: number;
  velocityScore: number;
  riskScore: number;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  tasksCompletedLast7Days?: number;
  tasksCompletedLast30Days?: number;
  averageTaskCompletionTimeDays?: number | null;
  daysUntilDeadline?: number | null;
  isOnSchedule?: boolean | null;
  estimatedCompletionDate?: string | null;
  calculatedAt?: string;
}

/** Client-side summary stored in the health map for cards and portfolio aggregation. */
export interface ProjectHealthSummary {
  taskCount: number;
  completedTaskCount: number;
  percentComplete: number;
  healthScore: number;
  progressScore?: number;
  velocityScore?: number;
  riskScore?: number;
}
