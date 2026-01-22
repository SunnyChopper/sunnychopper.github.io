import { apiClient } from '@/lib/api-client';
import type { DashboardSummaryResponse, DashboardSummaryRequest } from '@/types/api-contracts';

export const dashboardService = {
  getSummary: async (options?: DashboardSummaryRequest) => {
    const queryParams = new URLSearchParams();
    if (options?.includeCompleted !== undefined) {
      queryParams.append('includeCompleted', String(options.includeCompleted));
    }
    if (options?.taskLimit) {
      queryParams.append('taskLimit', String(options.taskLimit));
    }
    if (options?.transactionLimit) {
      queryParams.append('transactionLimit', String(options.transactionLimit));
    }

    const endpoint = `/growth-system/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<DashboardSummaryResponse>(endpoint);
  },
};
