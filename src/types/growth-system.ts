export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'planning' | 'active' | 'completed' | 'abandoned';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type MetricTrend = 'up' | 'down' | 'stable';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  streak: number;
  lastCompleted: string | null;
  target: number;
  category: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedAt: string;
  notes: string | null;
  userId: string;
}

export interface Metric {
  id: string;
  name: string;
  description: string | null;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
  trend: MetricTrend;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetricHistory {
  id: string;
  metricId: string;
  value: number;
  recordedAt: string;
  notes: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string;
  progress: number;
  status: GoalStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMetric {
  goalId: string;
  metricId: string;
}

export interface GoalProject {
  goalId: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookEntry {
  id: string;
  date: string;
  content: string;
  mood: string | null;
  tags: string[];
  aiAnalysis: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookTask {
  logbookEntryId: string;
  taskId: string;
}

export interface LogbookHabit {
  logbookEntryId: string;
  habitId: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  projectId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  projectId?: string;
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency: HabitFrequency;
  target: number;
  category?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  frequency?: HabitFrequency;
  target?: number;
  category?: string;
}

export interface CreateMetricInput {
  name: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: string;
}

export interface UpdateMetricInput {
  name?: string;
  description?: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  category?: string;
  trend?: MetricTrend;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  targetDate: string;
  status?: GoalStatus;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetDate?: string;
  progress?: number;
  status?: GoalStatus;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  progress?: number;
}

export interface CreateLogbookEntryInput {
  date: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export interface UpdateLogbookEntryInput {
  content?: string;
  mood?: string;
  tags?: string[];
  aiAnalysis?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
