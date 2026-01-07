export type Area = 'Health' | 'Wealth' | 'Love' | 'Happiness' | 'Operations' | 'DayJob';

export type SubCategory =
  | 'Physical' | 'Mental' | 'Spiritual' | 'Nutrition' | 'Sleep' | 'Exercise'
  | 'Income' | 'Expenses' | 'Investments' | 'Debt' | 'NetWorth'
  | 'Romantic' | 'Family' | 'Friends' | 'Social'
  | 'Joy' | 'Gratitude' | 'Purpose' | 'Peace'
  | 'Productivity' | 'Organization' | 'Systems' | 'Habits'
  | 'Career' | 'Skills' | 'Projects' | 'Performance';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type TaskStatus = 'NotStarted' | 'InProgress' | 'Blocked' | 'OnHold' | 'Done' | 'Cancelled';
export type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
export type GoalStatus = 'Planning' | 'Active' | 'OnTrack' | 'AtRisk' | 'Achieved' | 'Abandoned';
export type MetricStatus = 'Active' | 'Paused' | 'Archived';

export type TimeHorizon = 'Yearly' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Daily';

export type HabitType = 'Build' | 'Maintain' | 'Reduce' | 'Quit';
export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Custom';

export type MetricDirection = 'Higher' | 'Lower' | 'Target';
export type MetricSource = 'Manual' | 'App' | 'Device';
export type MetricUnit = 'count' | 'hours' | 'minutes' | 'dollars' | 'pounds' | 'kg' | 'percent' | 'rating' | 'custom';

export type LogbookMood = 'Low' | 'Steady' | 'High';

export type RecurrenceUnit = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  extendedDescription: string | null;
  area: Area;
  subCategory: SubCategory | null;
  priority: Priority;
  status: TaskStatus;
  size: number | null;
  dueDate: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurrenceRule: RecurrenceRule | null;
  pointValue: number | null;
  pointsAwarded: boolean | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: RecurrenceUnit;
  interval: number;
  endDate: string | null;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: string;
}

export interface TaskProject {
  taskId: string;
  projectId: string;
  createdAt: string;
}

export interface TaskGoal {
  taskId: string;
  goalId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  area: Area;
  subCategory: SubCategory | null;
  priority: Priority;
  status: ProjectStatus;
  impact: number;
  startDate: string | null;
  endDate: string | null;
  completedDate: string | null;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectGoal {
  projectId: string;
  goalId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  area: Area;
  subCategory: SubCategory | null;
  timeHorizon: TimeHorizon;
  priority: Priority;
  status: GoalStatus;
  targetDate: string | null;
  completedDate: string | null;
  successCriteria: string[];
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMetric {
  goalId: string;
  metricId: string;
  createdAt: string;
}

export interface GoalProject {
  goalId: string;
  projectId: string;
  createdAt: string;
}

export interface Metric {
  id: string;
  name: string;
  description: string | null;
  area: Area;
  subCategory: SubCategory | null;
  unit: MetricUnit;
  customUnit: string | null;
  direction: MetricDirection;
  targetValue: number | null;
  thresholdLow: number | null;
  thresholdHigh: number | null;
  source: MetricSource;
  status: MetricStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricLog {
  id: string;
  metricId: string;
  value: number;
  notes: string | null;
  loggedAt: string;
  userId: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  area: Area;
  subCategory: SubCategory | null;
  habitType: HabitType;
  frequency: HabitFrequency;
  dailyTarget: number | null;
  weeklyTarget: number | null;
  intent: string | null;
  trigger: string | null;
  action: string | null;
  reward: string | null;
  frictionUp: string | null;
  frictionDown: string | null;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitGoal {
  habitId: string;
  goalId: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  amount: number | null;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  title: string | null;
  notes: string | null;
  mood: LogbookMood | null;
  energy: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookTask {
  logbookEntryId: string;
  taskId: string;
  createdAt: string;
}

export interface LogbookProject {
  logbookEntryId: string;
  projectId: string;
  createdAt: string;
}

export interface LogbookGoal {
  logbookEntryId: string;
  goalId: string;
  createdAt: string;
}

export interface LogbookHabit {
  logbookEntryId: string;
  habitId: string;
  createdAt: string;
}

export interface AISuggestion {
  id: string;
  type: 'task_breakdown' | 'metric_suggestion' | 'habit_design' | 'goal_refinement' | 'dependency_detection' | 'priority_adjustment' | 'project_scope' | 'reflection_prompt' | 'pattern_insight' | 'risk_identification';
  title: string;
  description: string;
  confidence: number;
  reasoning: string | null;
  actionable: boolean;
  data: Record<string, unknown>;
  entityType: 'task' | 'project' | 'goal' | 'metric' | 'habit' | 'logbook' | null;
  entityId: string | null;
  createdAt: string;
  dismissedAt: string | null;
  acceptedAt: string | null;
}

export interface AIInsight {
  id: string;
  type: 'progress_analysis' | 'health_analysis' | 'pattern_recognition' | 'correlation' | 'forecast' | 'anomaly' | 'blocker_resolution' | 'capacity_planning';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
  relatedEntities: Array<{type: string; id: string}>;
  createdAt: string;
  viewedAt: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  extendedDescription?: string;
  area: Area;
  subCategory?: SubCategory;
  priority?: Priority;
  status?: TaskStatus;
  size?: number;
  dueDate?: string;
  scheduledDate?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  extendedDescription?: string;
  area?: Area;
  subCategory?: SubCategory;
  priority?: Priority;
  status?: TaskStatus;
  size?: number;
  dueDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  area: Area;
  subCategory?: SubCategory;
  priority?: Priority;
  status?: ProjectStatus;
  impact?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  area?: Area;
  subCategory?: SubCategory;
  priority?: Priority;
  status?: ProjectStatus;
  impact?: number;
  startDate?: string;
  endDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  area: Area;
  subCategory?: SubCategory;
  timeHorizon: TimeHorizon;
  priority?: Priority;
  status?: GoalStatus;
  targetDate?: string;
  successCriteria?: string[];
  notes?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  area?: Area;
  subCategory?: SubCategory;
  timeHorizon?: TimeHorizon;
  priority?: Priority;
  status?: GoalStatus;
  targetDate?: string;
  completedDate?: string;
  successCriteria?: string[];
  notes?: string;
}

export interface CreateMetricInput {
  name: string;
  description?: string;
  area: Area;
  subCategory?: SubCategory;
  unit: MetricUnit;
  customUnit?: string;
  direction: MetricDirection;
  targetValue?: number;
  thresholdLow?: number;
  thresholdHigh?: number;
  source?: MetricSource;
}

export interface UpdateMetricInput {
  name?: string;
  description?: string;
  area?: Area;
  subCategory?: SubCategory;
  unit?: MetricUnit;
  customUnit?: string;
  direction?: MetricDirection;
  targetValue?: number;
  thresholdLow?: number;
  thresholdHigh?: number;
  source?: MetricSource;
  status?: MetricStatus;
}

export interface CreateMetricLogInput {
  metricId: string;
  value: number;
  notes?: string;
  loggedAt?: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  area: Area;
  subCategory?: SubCategory;
  habitType: HabitType;
  frequency: HabitFrequency;
  dailyTarget?: number;
  weeklyTarget?: number;
  intent?: string;
  trigger?: string;
  action?: string;
  reward?: string;
  frictionUp?: string;
  frictionDown?: string;
  notes?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  area?: Area;
  subCategory?: SubCategory;
  habitType?: HabitType;
  frequency?: HabitFrequency;
  dailyTarget?: number;
  weeklyTarget?: number;
  intent?: string;
  trigger?: string;
  action?: string;
  reward?: string;
  frictionUp?: string;
  frictionDown?: string;
  notes?: string;
}

export interface CreateHabitLogInput {
  habitId: string;
  completedAt?: string;
  amount?: number;
  notes?: string;
}

export interface CreateLogbookEntryInput {
  date: string;
  title?: string;
  notes?: string;
  mood?: LogbookMood;
  energy?: number;
}

export interface UpdateLogbookEntryInput {
  title?: string;
  notes?: string;
  mood?: LogbookMood;
  energy?: number;
}

export interface FilterOptions {
  search?: string;
  area?: Area;
  subCategory?: SubCategory;
  priority?: Priority;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface DependencyGraphNode {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  area: Area;
  size: number | null;
}

export interface DependencyGraphEdge {
  source: string;
  target: string;
}

export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface RelationshipInput {
  entityType: 'task' | 'project' | 'goal' | 'metric' | 'habit' | 'logbook';
  entityId: string;
  relatedType: 'task' | 'project' | 'goal' | 'metric' | 'habit' | 'logbook';
  relatedId: string;
}

export interface EntitySummary {
  id: string;
  title: string;
  type: 'task' | 'project' | 'goal' | 'metric' | 'habit' | 'logbook';
  area: Area;
  status: string;
}

export interface DailyBriefing {
  date: string;
  topTasks: Task[];
  habitsToComplete: Habit[];
  metricsToLog: Metric[];
  insights: AIInsight[];
  energyForecast: number;
  suggestedFocus: string;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  tasksPlanned: number;
  habitConsistency: number;
  goalProgress: Array<{goalId: string; progress: number}>;
  keyWins: string[];
  areasForImprovement: string[];
  nextWeekPriorities: string[];
}
