import { apiClient } from '../../lib/api-client';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

export const projectsService = {
  async getAll(): Promise<ApiListResponse<Project>> {
    return apiClient.get<Project[]>('/projects');
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`/projects/${id}`);
  },

  async create(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>('/projects', input);
  },

  async update(id: string, input: UpdateProjectInput): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`/projects/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/projects/${id}`);
  },

  async calculateProgress(projectId: string): Promise<ApiResponse<number>> {
    return apiClient.post<number>(`/projects/${projectId}/calculate-progress`, {});
  },
};
