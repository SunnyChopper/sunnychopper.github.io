import { apiClient } from '../../lib/api-client';
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  UpdateHabitInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

// TODO: These service calls will connect to backend API once implemented
// For now, expects mocked responses or will fail until backend is ready
export const habitsService = {
  async getAll(): Promise<ApiListResponse<Habit>> {
    return apiClient.get<Habit[]>('/habits');
  },

  async getById(id: string): Promise<ApiResponse<Habit>> {
    return apiClient.get<Habit>(`/habits/${id}`);
  },

  async create(input: CreateHabitInput): Promise<ApiResponse<Habit>> {
    return apiClient.post<Habit>('/habits', input);
  },

  async update(id: string, input: UpdateHabitInput): Promise<ApiResponse<Habit>> {
    return apiClient.put<Habit>(`/habits/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/habits/${id}`);
  },

  async logCompletion(habitId: string, notes?: string): Promise<ApiResponse<HabitLog>> {
    return apiClient.post<HabitLog>(`/habits/${habitId}/log`, { notes });
  },

  async getHabitLogs(habitId: string): Promise<ApiListResponse<HabitLog>> {
    return apiClient.get<HabitLog[]>(`/habits/${habitId}/logs`);
  },
};
