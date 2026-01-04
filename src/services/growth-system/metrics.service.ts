import { apiClient } from '../../lib/api-client';
import type {
  Metric,
  MetricLog,
  CreateMetricInput,
  UpdateMetricInput,
  CreateMetricLogInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

// TODO: These service calls will connect to backend API once implemented
// For now, expects mocked responses or will fail until backend is ready
export const metricsService = {
  async getAll(): Promise<ApiListResponse<Metric>> {
    return apiClient.get<Metric[]>('/metrics');
  },

  async getById(id: string): Promise<ApiResponse<Metric>> {
    return apiClient.get<Metric>(`/metrics/${id}`);
  },

  async create(input: CreateMetricInput): Promise<ApiResponse<Metric>> {
    return apiClient.post<Metric>('/metrics', input);
  },

  async update(id: string, input: UpdateMetricInput): Promise<ApiResponse<Metric>> {
    return apiClient.put<Metric>(`/metrics/${id}`, input);
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/metrics/${id}`);
  },

  async getHistory(metricId: string): Promise<ApiListResponse<MetricLog>> {
    return apiClient.get<MetricLog[]>(`/metrics/${metricId}/history`);
  },

  async logValue(input: CreateMetricLogInput): Promise<ApiResponse<MetricLog>> {
    return apiClient.post<MetricLog>(`/metrics/${input.metricId}/logs`, input);
  },
};
