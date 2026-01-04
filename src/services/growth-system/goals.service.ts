import { apiClient } from '../../lib/api-client';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

// TODO: These service calls will connect to backend API once implemented
// For now, expects mocked responses or will fail until backend is ready
export const goalsService = {
  async getAll(): Promise<ApiListResponse<Goal>> {
    return apiClient.get<Goal[]>('/goals');
  },

  async getById(id: string): Promise<ApiResponse<Goal>> {
    return apiClient.get<Goal>(`/goals/${id}`);
  },

  async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
    return apiClient.post<Goal>('/goals', input);
  },

  async update(id: string, input: UpdateGoalInput): Promise<ApiResponse<Goal>> {
    return apiClient.put<Goal>(`/goals/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/goals/${id}`);
  },

  async linkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/goals/${goalId}/metrics`, { metricId });
  },

  async unlinkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/goals/${goalId}/metrics/${metricId}`);
  },

  async linkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/goals/${goalId}/projects`, { projectId });
  },

  async unlinkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/goals/${goalId}/projects/${projectId}`);
  },
};
