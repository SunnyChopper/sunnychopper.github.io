import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalMetric,
  GoalProject,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

export const goalsService = {
  async getAll(): Promise<ApiListResponse<Goal>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const goals = await storage.getAll<Goal>('goals');
    return { data: goals, total: goals.length, success: true };
  },

  async getById(id: string): Promise<ApiResponse<Goal>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const goal = await storage.getById<Goal>('goals', id);
    if (!goal) {
      return {
        data: undefined,
        error: { message: 'Goal not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: goal, success: true };
  },

  async create(input: CreateGoalInput): Promise<ApiResponse<Goal>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const goal: Goal = {
      id: generateId(),
      title: input.title,
      description: input.description || null,
      area: input.area,
      subCategory: input.subCategory || null,
      timeHorizon: input.timeHorizon || 'ShortTerm',
      priority: input.priority || 'P3',
      status: input.status || 'Planning',
      targetDate: input.targetDate || null,
      completedDate: null,
      successCriteria: input.successCriteria || [],
      notes: input.notes || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('goals', goal.id, goal);
    return { data: goal, success: true };
  },

  async update(id: string, input: UpdateGoalInput): Promise<ApiResponse<Goal>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<Goal>('goals', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Goal not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('goals', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Goal not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    // Delete related goal-metric links
    const allGoalMetrics = await storage.getAll<GoalMetric>('goalMetrics');
    for (const gm of allGoalMetrics.filter((gm) => gm.goalId === id)) {
      await storage.deleteRelation('goalMetrics', `${gm.goalId}-${gm.metricId}`);
    }

    // Delete related goal-project links
    const allGoalProjects = await storage.getAll<GoalProject>('goalProjects');
    for (const gp of allGoalProjects.filter((gp) => gp.goalId === id)) {
      await storage.deleteRelation('goalProjects', `${gp.goalId}-${gp.projectId}`);
    }

    return { data: undefined, success: true };
  },

  async linkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: GoalMetric = {
      goalId,
      metricId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('goalMetrics', `${goalId}-${metricId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkMetric(goalId: string, metricId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('goalMetrics', `${goalId}-${metricId}`);
    return { data: undefined, success: true };
  },

  async linkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: GoalProject = {
      goalId,
      projectId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('goalProjects', `${goalId}-${projectId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkProject(goalId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('goalProjects', `${goalId}-${projectId}`);
    return { data: undefined, success: true };
  },
};
