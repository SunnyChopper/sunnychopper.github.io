import { apiClient } from '../../lib/api-client';
import type {
  LogbookEntry,
  CreateLogbookEntryInput,
  UpdateLogbookEntryInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const logbookService = {
  async getAll(filters?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiListResponse<LogbookEntry>> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', String(filters.page));
    if (filters?.pageSize) queryParams.append('pageSize', String(filters.pageSize));

    const endpoint = `/logbook${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<LogbookEntry>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch logbook entries');
  },

  async getById(id: string): Promise<ApiResponse<LogbookEntry>> {
    const response = await apiClient.get<LogbookEntry>(`/logbook/${id}`);
    return response;
  },

  async getByDate(date: string): Promise<ApiResponse<LogbookEntry>> {
    const response = await apiClient.get<LogbookEntry>(`/logbook/${date}`);
    return response;
  },

  async create(input: CreateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    const response = await apiClient.post<LogbookEntry>('/logbook', input);
    return response;
  },

  async update(id: string, input: UpdateLogbookEntryInput): Promise<ApiResponse<LogbookEntry>> {
    const response = await apiClient.patch<LogbookEntry>(`/logbook/${id}`, input);
    return response;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/logbook/${id}`);
    return response;
  },

  async getLinks(
    entryId: string
  ): Promise<ApiListResponse<{ entityType: string; entityId: string }>> {
    const response = await apiClient.get<
      BackendPaginatedResponse<{ entityType: string; entityId: string }>
    >(`/logbook/${entryId}/links`);
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch logbook links');
  },

  async linkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`/logbook/${entryId}/links`, {
      entityType: 'task',
      entityId: taskId,
    });
    return response;
  },

  async unlinkTask(entryId: string, taskId: string): Promise<ApiResponse<void>> {
    // Backend may require linkId, but we'll use taskId as identifier
    const linksResponse = await this.getLinks(entryId);
    if (linksResponse.success && linksResponse.data) {
      const link = linksResponse.data.find((l) => l.entityType === 'task' && l.entityId === taskId);
      if (link) {
        const response = await apiClient.delete<void>(`/logbook/${entryId}/links/${link.entityId}`);
        return response;
      }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Link not found' },
    };
  },

  async linkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`/logbook/${entryId}/links`, {
      entityType: 'habit',
      entityId: habitId,
    });
    return response;
  },

  async unlinkHabit(entryId: string, habitId: string): Promise<ApiResponse<void>> {
    const linksResponse = await this.getLinks(entryId);
    if (linksResponse.success && linksResponse.data) {
      const link = linksResponse.data.find(
        (l) => l.entityType === 'habit' && l.entityId === habitId
      );
      if (link) {
        const response = await apiClient.delete<void>(`/logbook/${entryId}/links/${link.entityId}`);
        return response;
      }
    }
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Link not found' },
    };
  },
};
