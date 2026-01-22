import { apiClient } from '@/lib/api-client';
import type { ApiResponse, ApiListResponse } from '@/types/api-contracts';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  Metric,
  Task,
  Habit,
  GoalProgressBreakdown,
  GoalActivity,
  GoalStatus,
  Area,
} from '@/types/growth-system';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Normalizes goal status from API format (with spaces) to frontend format (without spaces).
 * The backend returns statuses like "On Track" but the frontend expects "OnTrack".
 */
function normalizeGoalStatus(status: string): GoalStatus {
  const statusMap: Record<string, GoalStatus> = {
    'On Track': 'OnTrack',
    'At Risk': 'AtRisk',
    Planning: 'Planning',
    Active: 'Active',
    Achieved: 'Achieved',
    Abandoned: 'Abandoned',
  };

  // If already in correct format, return as-is
  if (
    statusMap[status] === undefined &&
    ['Planning', 'Active', 'OnTrack', 'AtRisk', 'Achieved', 'Abandoned'].includes(status)
  ) {
    return status as GoalStatus;
  }

  return statusMap[status] || (status as GoalStatus);
}

/**
 * Denormalizes goal status from frontend format (without spaces) to API format (with spaces).
 * The frontend uses statuses like "OnTrack" but the backend expects "On Track".
 */
function denormalizeGoalStatus(status: GoalStatus): string {
  const statusMap: Record<GoalStatus, string> = {
    Planning: 'Planning',
    Active: 'Active',
    OnTrack: 'On Track',
    AtRisk: 'At Risk',
    Achieved: 'Achieved',
    Abandoned: 'Abandoned',
  };

  return statusMap[status] || status;
}

/**
 * Normalizes area from API format (with spaces) to frontend format (without spaces).
 * The backend returns areas like "Day Job" but the frontend expects "DayJob".
 */
function normalizeArea(area: string): Area {
  const areaMap: Record<string, Area> = {
    'Day Job': 'DayJob',
    Health: 'Health',
    Wealth: 'Wealth',
    Love: 'Love',
    Happiness: 'Happiness',
    Operations: 'Operations',
  };

  // If already in correct format, return as-is
  if (
    areaMap[area] === undefined &&
    ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'].includes(area)
  ) {
    return area as Area;
  }

  return areaMap[area] || (area as Area);
}

/**
 * Denormalizes area from frontend format (without spaces) to API format (with spaces).
 * The frontend uses areas like "DayJob" but the backend expects "Day Job".
 */
function denormalizeArea(area: Area): string {
  const areaMap: Record<Area, string> = {
    Health: 'Health',
    Wealth: 'Wealth',
    Love: 'Love',
    Happiness: 'Happiness',
    Operations: 'Operations',
    DayJob: 'Day Job',
  };

  return areaMap[area] || area;
}

/**
 * Normalizes a goal object by converting status and area from API format to frontend format.
 */
function normalizeGoal(goal: Goal): Goal {
  return {
    ...goal,
    status: normalizeGoalStatus(goal.status as string),
    area: normalizeArea(goal.area as string),
  };
}

export const goalsService = {
  async getAll(filters?: {
    area?: string;
    status?: string;
    priority?: string;
  }): Promise<ApiListResponse<Goal>> {
    const queryParams = new URLSearchParams();
    // Convert area from frontend format (camelCase) to backend format (with spaces)
    if (filters?.area) queryParams.append('area', denormalizeArea(filters.area as Area));
    // Convert status from frontend format (camelCase) to backend format (with spaces)
    if (filters?.status)
      queryParams.append('status', denormalizeGoalStatus(filters.status as GoalStatus));
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const endpoint = `/goals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<Goal>>(endpoint);

    if (response.success && response.data) {
      // Normalize goal statuses from API format (with spaces) to frontend format (without spaces)
      const normalizedGoals = response.data.data.map(normalizeGoal);
      return {
        data: normalizedGoals,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch goals');
  },

  async getById(id: string): Promise<ApiResponse<Goal>> {
    const response = await apiClient.get<Goal>(`/goals/${id}`);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeGoal(response.data),
      };
    }
    return response;
  },

  async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
    // Prepare request body matching backend schema
    // Convert area and status from frontend format (camelCase) to backend format (with spaces)
    const requestBody: Omit<CreateGoalInput, 'area' | 'status'> & {
      area: string;
      status?: string;
    } = {
      ...input,
      area: denormalizeArea(input.area),
      status: input.status ? denormalizeGoalStatus(input.status) : undefined,
    };

    const response = await apiClient.post<Goal>('/goals', requestBody);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeGoal(response.data),
      };
    }
    return response;
  },

  async update(id: string, input: UpdateGoalInput): Promise<ApiResponse<Goal>> {
    // Convert area and status from frontend format (camelCase) to backend format (with spaces)
    const requestBody: Omit<UpdateGoalInput, 'area' | 'status'> & {
      area?: string;
      status?: string;
    } = {
      ...input,
      area: input.area ? denormalizeArea(input.area) : undefined,
      status: input.status ? denormalizeGoalStatus(input.status) : undefined,
    };

    const response = await apiClient.patch<Goal>(`/goals/${id}`, requestBody);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeGoal(response.data),
      };
    }
    return response;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/goals/${id}`);
    return response;
  },

  async linkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`/goals/${goalId}/metrics`, { metricId });
    return response;
  },

  async unlinkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/goals/${goalId}/metrics/${metricId}`);
    return response;
  },

  async linkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    // Note: Backend may not have this endpoint, using tasks endpoint pattern
    const response = await apiClient.post<void>(`/goals/${goalId}/projects`, { projectId });
    return response;
  },

  async unlinkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/goals/${goalId}/projects/${projectId}`);
    return response;
  },

  async getLinkedMetrics(goalId: string): Promise<ApiListResponse<Metric>> {
    const response = await apiClient.get<BackendPaginatedResponse<Metric>>(
      `/goals/${goalId}/metrics`
    );
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch linked metrics');
  },

  async getLinkedProjects(
    goalId: string
  ): Promise<ApiListResponse<import('../../types/growth-system').Project>> {
    // Note: Backend may not have this endpoint
    const response = await apiClient.get<
      BackendPaginatedResponse<import('../../types/growth-system').Project>
    >(`/goals/${goalId}/projects`);
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch linked projects');
  },

  async getLinkedTasks(goalId: string): Promise<ApiListResponse<Task>> {
    const response = await apiClient.get<BackendPaginatedResponse<Task>>(`/goals/${goalId}/tasks`);
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch linked tasks');
  },

  async getLinkedHabits(goalId: string): Promise<ApiListResponse<Habit>> {
    const response = await apiClient.get<BackendPaginatedResponse<Habit>>(
      `/goals/${goalId}/habits`
    );
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch linked habits');
  },

  async linkHabit(goalId: string, habitId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`/goals/${goalId}/habits`, { habitId });
    return response;
  },

  async unlinkHabit(goalId: string, habitId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/goals/${goalId}/habits/${habitId}`);
    return response;
  },

  async getProgress(goalId: string): Promise<ApiResponse<GoalProgressBreakdown>> {
    const response = await apiClient.get<GoalProgressBreakdown>(`/goals/${goalId}/progress`);
    return response;
  },

  async completeCriterion(goalId: string, criterionId: string): Promise<ApiResponse<Goal>> {
    const response = await apiClient.post<Goal>(
      `/goals/${goalId}/criteria/${criterionId}/complete`
    );
    return response;
  },

  async getActivities(goalId: string, limit?: number): Promise<ApiListResponse<GoalActivity>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', String(limit));

    const endpoint = `/goals/${goalId}/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<GoalActivity>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch goal activities');
  },

  async updateCriterion(
    goalId: string,
    criterionId: string,
    updates: { isCompleted: boolean; completedAt: string | null }
  ): Promise<ApiResponse<Goal>> {
    const response = await apiClient.patch<Goal>(
      `/goals/${goalId}/criteria/${criterionId}`,
      updates
    );
    return response;
  },

  async logActivity(
    goalId: string,
    activity: Omit<GoalActivity, 'id' | 'goalId' | 'createdAt'>
  ): Promise<ApiResponse<GoalActivity>> {
    const response = await apiClient.post<GoalActivity>(`/goals/${goalId}/activity`, activity);
    return response;
  },
};
