import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import { llmConfig } from '../../lib/llm';
import { taskPointsAIService } from '../ai/task-points.service';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskDependency,
  TaskProject,
  TaskGoal,
  FilterOptions,
  PaginatedResponse,
  DependencyGraph,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

function applyFilters(tasks: Task[], filters?: FilterOptions): Task[] {
  let filtered = [...tasks];

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
    );
  }

  if (filters?.area) {
    filtered = filtered.filter((t) => t.area === filters.area);
  }

  if (filters?.subCategory) {
    filtered = filtered.filter((t) => t.subCategory === filters.subCategory);
  }

  if (filters?.priority) {
    filtered = filtered.filter((t) => t.priority === filters.priority);
  }

  if (filters?.status) {
    filtered = filtered.filter((t) => t.status === filters.status);
  }

  if (filters?.sortBy) {
    const sortBy = filters.sortBy as keyof Task;
    const order = filters.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (aVal < bVal) return -order;
      if (aVal > bVal) return order;
      return 0;
    });
  }

  return filtered;
}

export const tasksService = {
  async getAll(filters?: FilterOptions): Promise<PaginatedResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allTasks = await storage.getAll<Task>('tasks');
    const filtered = applyFilters(allTasks, filters);

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  async getById(id: string): Promise<ApiResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const task = await storage.getById<Task>('tasks', id);
    if (!task) {
      return {
        data: undefined,
        error: { message: 'Task not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: task, success: true };
  },

  async create(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    let pointValue = input.pointValue || null;

    if (pointValue === null && llmConfig.isConfigured()) {
      try {
        const calculation = await taskPointsAIService.calculateTaskPoints({
          title: input.title,
          description: input.description,
          area: input.area,
          priority: input.priority || 'P3',
          size: input.size,
        });
        pointValue = calculation.pointValue;
      } catch (error) {
        console.warn('Failed to calculate task points with AI:', error);
      }
    }

    const task: Task = {
      id: generateId(),
      title: input.title,
      description: input.description || null,
      extendedDescription: input.extendedDescription || null,
      area: input.area,
      subCategory: input.subCategory || null,
      priority: input.priority || 'P3',
      status: input.status || 'NotStarted',
      size: input.size || null,
      dueDate: input.dueDate || null,
      scheduledDate: input.scheduledDate || null,
      completedDate: null,
      notes: input.notes || null,
      isRecurring: input.isRecurring || false,
      recurrenceRule: input.recurrenceRule || null,
      pointValue,
      pointsAwarded: null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('tasks', task.id, task);
    return { data: task, success: true };
  },

  async update(id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<Task>('tasks', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Task not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('tasks', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Task not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    const allDeps = await storage.getAll<TaskDependency>('taskDependencies');
    for (const dep of allDeps.filter((d) => d.taskId === id || d.dependsOnTaskId === id)) {
      await storage.delete('taskDependencies', dep.id);
    }

    const allTaskProjects = await storage.getAll<TaskProject>('taskProjects');
    for (const tp of allTaskProjects.filter((tp) => tp.taskId === id)) {
      await storage.deleteRelation('taskProjects', `${tp.taskId}-${tp.projectId}`);
    }

    const allTaskGoals = await storage.getAll<TaskGoal>('taskGoals');
    for (const tg of allTaskGoals.filter((tg) => tg.taskId === id)) {
      await storage.deleteRelation('taskGoals', `${tg.taskId}-${tg.goalId}`);
    }

    return { data: undefined, success: true };
  },

  async addDependency(taskId: string, dependsOnTaskId: string): Promise<ApiResponse<TaskDependency>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const dependency: TaskDependency = {
      id: generateId(),
      taskId,
      dependsOnTaskId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('taskDependencies', dependency.id, dependency as unknown as Record<string, unknown>);
    return { data: dependency, success: true };
  },

  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allDeps = await storage.getAll<TaskDependency>('taskDependencies');
    const dep = allDeps.find((d) => d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId);
    if (dep) {
      await storage.delete('taskDependencies', dep.id);
    }
    return { data: undefined, success: true };
  },

  async getDependencies(taskId: string): Promise<ApiResponse<TaskDependency[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deps = await storage.getRelations<TaskDependency>('taskDependencies', { taskId });
    return { data: deps, success: true };
  },

  async linkToProject(taskId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: TaskProject = {
      taskId,
      projectId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('taskProjects', `${taskId}-${projectId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkFromProject(taskId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('taskProjects', `${taskId}-${projectId}`);
    return { data: undefined, success: true };
  },

  async getByProject(projectId: string): Promise<ApiListResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allLinks = await storage.getRelations<TaskProject>('taskProjects', { projectId });
    const taskIds = allLinks.map((tp) => tp.taskId);
    const allTasks = await storage.getAll<Task>('tasks');
    const tasks = allTasks.filter((t) => taskIds.includes(t.id));
    return { data: tasks, total: tasks.length, success: true };
  },

  async linkToGoal(taskId: string, goalId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const link: TaskGoal = {
      taskId,
      goalId,
      createdAt: new Date().toISOString(),
    };
    await storage.createRelation('taskGoals', `${taskId}-${goalId}`, link as unknown as Record<string, unknown>);
    return { data: undefined, success: true };
  },

  async unlinkFromGoal(taskId: string, goalId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    await storage.deleteRelation('taskGoals', `${taskId}-${goalId}`);
    return { data: undefined, success: true };
  },

  async getByGoal(goalId: string): Promise<ApiListResponse<Task>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allLinks = await storage.getRelations<TaskGoal>('taskGoals', { goalId });
    const taskIds = allLinks.map((tg) => tg.taskId);
    const allTasks = await storage.getAll<Task>('tasks');
    const tasks = allTasks.filter((t) => taskIds.includes(t.id));
    return { data: tasks, total: tasks.length, success: true };
  },

  async getDependencyGraph(filters?: FilterOptions): Promise<ApiResponse<DependencyGraph>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const allTasks = await storage.getAll<Task>('tasks');
    const filtered = applyFilters(allTasks, filters);
    const allDeps = await storage.getAll<TaskDependency>('taskDependencies');

    const taskIds = new Set(filtered.map((t) => t.id));
    const relevantDeps = allDeps.filter(
      (d) => taskIds.has(d.taskId) && taskIds.has(d.dependsOnTaskId)
    );

    const graph: DependencyGraph = {
      nodes: filtered.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        area: t.area,
        size: t.size,
      })),
      edges: relevantDeps.map((d) => ({
        source: d.dependsOnTaskId,
        target: d.taskId,
      })),
    };

    return { data: graph, success: true };
  },
};
