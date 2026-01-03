import type {
  Task,
  Habit,
  Metric,
  Goal,
  Project,
  LogbookEntry,
  MetricHistory,
  HabitLog,
  CreateTaskInput,
  UpdateTaskInput,
  CreateHabitInput,
  UpdateHabitInput,
  CreateMetricInput,
  UpdateMetricInput,
  CreateGoalInput,
  UpdateGoalInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
} from './growth-system';

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface TasksApiContract {
  getAll: () => Promise<ApiListResponse<Task>>;
  getById: (id: string) => Promise<ApiResponse<Task>>;
  create: (input: CreateTaskInput) => Promise<ApiResponse<Task>>;
  update: (id: string, input: UpdateTaskInput) => Promise<ApiResponse<Task>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getByProject: (projectId: string) => Promise<ApiListResponse<Task>>;
}

export interface HabitsApiContract {
  getAll: () => Promise<ApiListResponse<Habit>>;
  getById: (id: string) => Promise<ApiResponse<Habit>>;
  create: (input: CreateHabitInput) => Promise<ApiResponse<Habit>>;
  update: (id: string, input: UpdateHabitInput) => Promise<ApiResponse<Habit>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  logCompletion: (habitId: string, notes?: string) => Promise<ApiResponse<HabitLog>>;
  getLogs: (habitId: string) => Promise<ApiListResponse<HabitLog>>;
}

export interface MetricsApiContract {
  getAll: () => Promise<ApiListResponse<Metric>>;
  getById: (id: string) => Promise<ApiResponse<Metric>>;
  create: (input: CreateMetricInput) => Promise<ApiResponse<Metric>>;
  update: (id: string, input: UpdateMetricInput) => Promise<ApiResponse<Metric>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  getHistory: (metricId: string) => Promise<ApiListResponse<MetricHistory>>;
}

export interface GoalsApiContract {
  getAll: () => Promise<ApiListResponse<Goal>>;
  getById: (id: string) => Promise<ApiResponse<Goal>>;
  create: (input: CreateGoalInput) => Promise<ApiResponse<Goal>>;
  update: (id: string, input: UpdateGoalInput) => Promise<ApiResponse<Goal>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  linkMetric: (goalId: string, metricId: string) => Promise<ApiResponse<void>>;
  unlinkMetric: (goalId: string, metricId: string) => Promise<ApiResponse<void>>;
  linkProject: (goalId: string, projectId: string) => Promise<ApiResponse<void>>;
  unlinkProject: (goalId: string, projectId: string) => Promise<ApiResponse<void>>;
}

export interface ProjectsApiContract {
  getAll: () => Promise<ApiListResponse<Project>>;
  getById: (id: string) => Promise<ApiResponse<Project>>;
  create: (input: CreateProjectInput) => Promise<ApiResponse<Project>>;
  update: (id: string, input: UpdateProjectInput) => Promise<ApiResponse<Project>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  calculateProgress: (projectId: string) => Promise<ApiResponse<number>>;
}

export interface LogbookApiContract {
  getAll: () => Promise<ApiListResponse<LogbookEntry>>;
  getById: (id: string) => Promise<ApiResponse<LogbookEntry>>;
  getByDate: (date: string) => Promise<ApiResponse<LogbookEntry>>;
  create: (input: CreateLogbookEntryInput) => Promise<ApiResponse<LogbookEntry>>;
  update: (id: string, input: UpdateLogbookEntryInput) => Promise<ApiResponse<LogbookEntry>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  linkTask: (entryId: string, taskId: string) => Promise<ApiResponse<void>>;
  unlinkTask: (entryId: string, taskId: string) => Promise<ApiResponse<void>>;
  linkHabit: (entryId: string, habitId: string) => Promise<ApiResponse<void>>;
  unlinkHabit: (entryId: string, habitId: string) => Promise<ApiResponse<void>>;
}

export interface GrowthSystemApi {
  tasks: TasksApiContract;
  habits: HabitsApiContract;
  metrics: MetricsApiContract;
  goals: GoalsApiContract;
  projects: ProjectsApiContract;
  logbook: LogbookApiContract;
}
