import { normalizeDashboardSummary, normalizeProject } from '@/services/normalization';
import type { DashboardSummaryDto } from '@/types/api/dashboard.dto';
import type { ProjectDto } from '@/types/api/projects.dto';

describe('project normalization', () => {
  it('normalizes a Project DTO from the backend', () => {
    const dto: ProjectDto = {
      id: '01kfq8bcqtrq0962jdf6c88mh2',
      name: 'AWS Certification',
      description: null,
      area: 'Day Job',
      status: 'Active',
      priority: 'P1',
      impact: 5,
      start_date: '2026-01-01',
      target_end_date: '2026-03-31',
      actual_end_date: null,
      tags: null,
      notes: null,
      task_count: 0,
      completed_task_count: 0,
      health_score: 20.0,
      user_id: 'e4788498-40e1-7060-bc2d-79673636050d',
      created_at: '2026-01-24T05:41:38.170365Z',
      updated_at: '2026-01-24T20:34:23.998159Z',
    };

    const normalized = normalizeProject(dto);

    expect(normalized.area).toBe('Day Job');
    expect(normalized.startDate).toBe('2026-01-01');
    expect(normalized.endDate).toBe('2026-03-31');
    expect(normalized.completedDate).toBeNull();
    expect(normalized.subCategory).toBeNull();
  });

  it('normalizes dashboard summary projects', () => {
    const dto: DashboardSummaryDto = {
      tasks: [],
      goals: [],
      projects: [
        {
          id: 'p1',
          name: 'Project One',
          area: 'Day Job',
          status: 'On Hold',
          priority: 'P2',
          impact: 4,
          start_date: '2026-01-02',
          target_end_date: '2026-02-20',
          sub_category: 'Career',
          user_id: 'user-1',
          created_at: '2026-01-24T05:41:38.170365Z',
          updated_at: '2026-01-24T20:34:23.998159Z',
        },
      ],
      habits: [],
      metrics: [],
      logbookEntries: [],
      rewards: [],
      wallet: {
        balance: {
          userId: 'user-1',
          totalPoints: 0,
          lifetimeEarned: 0,
          lifetimeSpent: 0,
          updatedAt: '2026-01-24T05:41:38.170365Z',
        },
        recentTransactions: [],
      },
    };

    const normalized = normalizeDashboardSummary(dto);

    expect(normalized.projects[0].area).toBe('Day Job');
    expect(normalized.projects[0].status).toBe('On Hold');
    expect(normalized.projects[0].startDate).toBe('2026-01-02');
    expect(normalized.projects[0].endDate).toBe('2026-02-20');
    expect(normalized.projects[0].subCategory).toBe('Career');
  });
});
