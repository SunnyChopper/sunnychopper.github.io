import type { DashboardSummaryResponse } from '@/types/api-contracts';
import type { DashboardSummaryDto } from '@/types/api/dashboard.dto';
import { normalizeProject } from './project-normalizer';

export function normalizeDashboardSummary(summary: DashboardSummaryDto): DashboardSummaryResponse {
  return {
    ...summary,
    projects: summary.projects.map(normalizeProject),
  };
}
