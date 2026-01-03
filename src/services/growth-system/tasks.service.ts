import { apiClient } from '../../lib/api-client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

export const tasksService = {
  async getAll(): Promise<ApiListResponse<Task>> {
    return apiClient.get<Task[]>('/tasks');
  },

  async getById(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async create(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>('/tasks', input);
  },

  async update(id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`/tasks/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },

  async getByProjectId(projectId: string): Promise<ApiListResponse<Task>> {
    return apiClient.get<Task[]>(`/tasks?project_id=${projectId}`);
  },
};
