import { MockStorage, generateId, randomDelay } from '../../mocks/storage';
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

const taskStorage = new MockStorage<Task>('tasks');
const taskDependencyStorage = new MockStorage<TaskDependency>('taskDependencies');
const taskProjectStorage = new MockStorage<TaskProject>('taskProjects');
const taskGoalStorage = new MockStorage<TaskGoal>('taskGoals');

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
    const allTasks = taskStorage.getAll();
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
    const task = taskStorage.getById(id);
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
    const now = new Date().toISOString();
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
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    taskStorage.create(task.id, task);
    return { data: task, success: true };
  },

  async update(id: string, input: UpdateTaskInput): Promise<ApiResponse<Task>> {
    await randomDelay();
    const updated = taskStorage.update(id, {
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
    const deleted = taskStorage.delete(id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Task not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    const allDeps = taskDependencyStorage.getAll();
    allDeps
      .filter((d) => d.taskId === id || d.dependsOnTaskId === id)
      .forEach((d) => taskDependencyStorage.delete(d.id));

    const allTaskProjects = taskProjectStorage.getAll();
    allTaskProjects
      .filter((tp) => tp.taskId === id)
      .forEach((tp) => taskProjectStorage.delete(`${tp.taskId}-${tp.projectId}`));

    const allTaskGoals = taskGoalStorage.getAll();
    allTaskGoals
      .filter((tg) => tg.taskId === id)
      .forEach((tg) => taskGoalStorage.delete(`${tg.taskId}-${tg.goalId}`));

    return { data: undefined, success: true };
  },

  async addDependency(taskId: string, dependsOnTaskId: string): Promise<ApiResponse<TaskDependency>> {
    await randomDelay();
    const dependency: TaskDependency = {
      id: generateId(),
      taskId,
      dependsOnTaskId,
      createdAt: new Date().toISOString(),
    };
    taskDependencyStorage.create(dependency.id, dependency);
    return { data: dependency, success: true };
  },

  async removeDependency(taskId: string, dependsOnTaskId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const allDeps = taskDependencyStorage.getAll();
    const dep = allDeps.find((d) => d.taskId === taskId && d.dependsOnTaskId === dependsOnTaskId);
    if (dep) {
      taskDependencyStorage.delete(dep.id);
    }
    return { data: undefined, success: true };
  },

  async getDependencies(taskId: string): Promise<ApiResponse<TaskDependency[]>> {
    await randomDelay();
    const allDeps = taskDependencyStorage.getAll();
    const deps = allDeps.filter((d) => d.taskId === taskId);
    return { data: deps, success: true };
  },

  async linkToProject(taskId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const link: TaskProject = {
      taskId,
      projectId,
      createdAt: new Date().toISOString(),
    };
    taskProjectStorage.create(`${taskId}-${projectId}`, link);
    return { data: undefined, success: true };
  },

  async unlinkFromProject(taskId: string, projectId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    taskProjectStorage.delete(`${taskId}-${projectId}`);
    return { data: undefined, success: true };
  },

  async getByProject(projectId: string): Promise<ApiListResponse<Task>> {
    await randomDelay();
    const allLinks = taskProjectStorage.getAll();
    const taskIds = allLinks.filter((tp) => tp.projectId === projectId).map((tp) => tp.taskId);
    const allTasks = taskStorage.getAll();
    const tasks = allTasks.filter((t) => taskIds.includes(t.id));
    return { data: tasks, total: tasks.length, success: true };
  },

  async linkToGoal(taskId: string, goalId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const link: TaskGoal = {
      taskId,
      goalId,
      createdAt: new Date().toISOString(),
    };
    taskGoalStorage.create(`${taskId}-${goalId}`, link);
    return { data: undefined, success: true };
  },

  async unlinkFromGoal(taskId: string, goalId: string): Promise<ApiResponse<void>> {
    await randomDelay();
    taskGoalStorage.delete(`${taskId}-${goalId}`);
    return { data: undefined, success: true };
  },

  async getByGoal(goalId: string): Promise<ApiListResponse<Task>> {
    await randomDelay();
    const allLinks = taskGoalStorage.getAll();
    const taskIds = allLinks.filter((tg) => tg.goalId === goalId).map((tg) => tg.taskId);
    const allTasks = taskStorage.getAll();
    const tasks = allTasks.filter((t) => taskIds.includes(t.id));
    return { data: tasks, total: tasks.length, success: true };
  },

  async getDependencyGraph(filters?: FilterOptions): Promise<ApiResponse<DependencyGraph>> {
    await randomDelay();
    const allTasks = taskStorage.getAll();
    const filtered = applyFilters(allTasks, filters);
    const allDeps = taskDependencyStorage.getAll();

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
