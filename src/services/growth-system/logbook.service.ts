import { apiClient } from '../../lib/api-client';
import type {
  LogbookEntry,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

// TODO: These service calls will connect to backend API once implemented
// For now, expects mocked responses or will fail until backend is ready
export const logbookService = {
  async getAll(): Promise<ApiListResponse<LogbookEntry>> {
    return apiClient.get<LogbookEntry[]>('/logbook');
  },

  async getById(id: string): Promise<ApiResponse<LogbookEntry>> {
    return apiClient.get<LogbookEntry>(`/logbook/${id}`);
  },

  async getByDate(date: string): Promise<ApiResponse<LogbookEntry>> {
    return apiClient.get<LogbookEntry>(`/logbook/by-date/${date}`);
  },

  async create(input: CreateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    return apiClient.post<LogbookEntry>('/logbook', input);
  },

  async update(id: string, input: UpdateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    return apiClient.put<LogbookEntry>(`/logbook/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/logbook/${id}`);
  },

  async linkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/logbook/${entryId}/tasks`, { taskId });
  },

  async unlinkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/logbook/${entryId}/tasks/${taskId}`);
  },

  async linkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/logbook/${entryId}/habits`, { habitId });
  },

  async unlinkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/logbook/${entryId}/habits/${habitId}`);
  },
};
