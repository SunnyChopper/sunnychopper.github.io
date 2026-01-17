import { apiClient } from '../../lib/api-client';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  Metric,
  Task,
  Habit,
  GoalProgressBreakdown,
  GoalActivity,
} from '../../types/growth-system';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const goalsService = {
  async getAll(filters?: {
    area?: string;
    status?: string;
    priority?: string;
  }): Promise<ApiListResponse<Goal>> {
    const queryParams = new URLSearchParams();
    if (filters?.area) queryParams.append('area', filters.area);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const endpoint = `/goals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<Goal>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch goals');
  },

  async getById(id: string): Promise<ApiResponse<Goal>> {
    const response = await apiClient.get<Goal>(`/goals/${id}`);
    return response;
  },

  async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
    const response = await apiClient.post<Goal>('/goals', input);
    return response;
  },

  async update(id: string, input: UpdateGoalInput): Promise<ApiResponse<Goal>> {
    const response = await apiClient.patch<Goal>(`/goals/${id}`, input);
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
};
