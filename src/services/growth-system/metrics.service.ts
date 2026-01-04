import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Metric,
  MetricLog,
  CreateMetricInput,
  UpdateMetricInput,
  CreateMetricLogInput,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

export const metricsService = {
  async getAll(): Promise<ApiListResponse<Metric>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const metrics = await storage.getAll<Metric>('metrics');
    return { data: metrics, total: metrics.length, success: true };
  },

  async getById(id: string): Promise<ApiResponse<Metric>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const metric = await storage.getById<Metric>('metrics', id);
    if (!metric) {
      return {
        data: undefined,
        error: { message: 'Metric not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: metric, success: true };
  },

  async create(input: CreateMetricInput): Promise<ApiResponse<Metric>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const metric: Metric = {
      id: generateId(),
      name: input.name,
      description: input.description || null,
      area: input.area,
      subCategory: input.subCategory || null,
      unit: input.unit,
      customUnit: input.customUnit || null,
      direction: input.direction,
      targetValue: input.targetValue || null,
      thresholdLow: input.thresholdLow || null,
      thresholdHigh: input.thresholdHigh || null,
      source: input.source || 'Manual',
      status: 'Active',
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('metrics', metric.id, metric);
    return { data: metric, success: true };
  },

  async update(id: string, input: UpdateMetricInput): Promise<ApiResponse<Metric>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<Metric>('metrics', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Metric not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('metrics', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Metric not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    // Delete related metric logs
    const allLogs = await storage.getAll<MetricLog>('metricLogs');
    for (const log of allLogs.filter((l) => l.metricId === id)) {
      await storage.delete('metricLogs', log.id);
    }

    return { data: undefined, success: true };
  },

  async getHistory(metricId: string): Promise<ApiListResponse<MetricLog>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allLogs = await storage.getAll<MetricLog>('metricLogs');
    const logs = allLogs
      .filter((l) => l.metricId === metricId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    return { data: logs, total: logs.length, success: true };
  },

  async logValue(input: CreateMetricLogInput): Promise<ApiResponse<MetricLog>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const log: MetricLog = {
      id: generateId(),
      metricId: input.metricId,
      value: input.value,
      notes: input.notes || null,
      loggedAt: input.loggedAt || now,
      userId: USER_ID,
      createdAt: now,
    };
    await storage.create('metricLogs', log.id, log);

    return { data: log, success: true };
  },
};
