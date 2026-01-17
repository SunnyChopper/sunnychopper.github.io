import { apiClient } from '../../lib/api-client';
import type {
  Metric,
  MetricLog,
  CreateMetricInput,
  UpdateMetricInput,
  CreateMetricLogInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface MetricAnalytics {
  trend: {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    velocity: number;
    acceleration: number;
    isImproving: boolean;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
    isOnTrack: boolean;
  };
  streak: {
    current: number;
    longest: number;
  };
  prediction: {
    futureValue: number;
    daysAhead: number;
    confidence: number;
  };
}

interface MetricMilestone {
  id: string;
  metricId: string;
  type: string;
  value: number;
  achievedAt: string;
  pointsAwarded: number;
}

interface MetricInsight {
  type: string;
  content: Record<string, unknown>;
  cachedAt: string;
  expiresAt: string;
}

export const metricsService = {
  async getAll(filters?: { area?: string; status?: string }): Promise<ApiListResponse<Metric>> {
    const queryParams = new URLSearchParams();
    if (filters?.area) queryParams.append('area', filters.area);
    if (filters?.status) queryParams.append('status', filters.status);

    const endpoint = `/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<Metric>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch metrics');
  },

  async getById(id: string): Promise<ApiResponse<Metric>> {
    const response = await apiClient.get<Metric>(`/metrics/${id}`);
    return response;
  },

  async create(input: CreateMetricInput): Promise<ApiResponse<Metric>> {
    const response = await apiClient.post<Metric>('/metrics', input);
    return response;
  },

  async update(id: string, input: UpdateMetricInput): Promise<ApiResponse<Metric>> {
    const response = await apiClient.patch<Metric>(`/metrics/${id}`, input);
    return response;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/metrics/${id}`);
    return response;
  },

  async getHistory(metricId: string, filters?: { startDate?: string; endDate?: string; limit?: number }): Promise<ApiListResponse<MetricLog>> {
    const queryParams = new URLSearchParams();
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', String(filters.limit));

    const endpoint = `/metrics/${metricId}/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<MetricLog>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch metric logs');
  },

  async logValue(input: CreateMetricLogInput): Promise<ApiResponse<MetricLog>> {
    const response = await apiClient.post<MetricLog>(`/metrics/${input.metricId}/logs`, {
      value: input.value,
      loggedAt: input.loggedAt,
      notes: input.notes,
    });
    return response;
  },

  async deleteLog(metricId: string, logId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/metrics/${metricId}/logs/${logId}`);
    return response;
  },

  async getAnalytics(metricId: string): Promise<ApiResponse<MetricAnalytics>> {
    const response = await apiClient.get<MetricAnalytics>(`/metrics/${metricId}/analytics`);
    return response;
  },

  async getMilestones(metricId: string): Promise<ApiListResponse<MetricMilestone>> {
    const response = await apiClient.get<BackendPaginatedResponse<MetricMilestone>>(`/metrics/${metricId}/milestones`);
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch milestones');
  },

  async getInsights(metricId: string): Promise<ApiResponse<MetricInsight>> {
    const response = await apiClient.get<MetricInsight>(`/metrics/${metricId}/insights`);
    return response;
  },
};
