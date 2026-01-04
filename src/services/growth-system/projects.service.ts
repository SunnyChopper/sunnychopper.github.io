import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Task,
  TaskProject,
} from '../../types/growth-system';
import type { ApiResponse, ApiListResponse } from '../../types/api-contracts';

const USER_ID = 'user-1';

export const projectsService = {
  async getAll(): Promise<ApiListResponse<Project>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const projects = await storage.getAll<Project>('projects');
    return { data: projects, total: projects.length, success: true };
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const project = await storage.getById<Project>('projects', id);
    if (!project) {
      return {
        data: undefined,
        error: { message: 'Project not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: project, success: true };
  },

  async create(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description || null,
      area: input.area,
      subCategory: input.subCategory || null,
      status: input.status || 'Planning',
      priority: input.priority || 'P3',
      impact: input.impact || 0,
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      completedDate: null,
      notes: input.notes || null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };
    await storage.create('projects', project.id, project);
    return { data: project, success: true };
  },

  async update(id: string, input: UpdateProjectInput): Promise<ApiResponse<Project>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const updated = await storage.update<Project>('projects', id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    if (!updated) {
      return {
        data: undefined,
        error: { message: 'Project not found', code: 'NOT_FOUND' },
        success: false,
      };
    }
    return { data: updated, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const deleted = await storage.delete('projects', id);
    if (!deleted) {
      return {
        data: undefined,
        error: { message: 'Project not found', code: 'NOT_FOUND' },
        success: false,
      };
    }

    // Delete related task-project links
    const allTaskProjects = await storage.getAll<TaskProject>('taskProjects');
    for (const tp of allTaskProjects.filter((tp) => tp.projectId === id)) {
      await storage.deleteRelation('taskProjects', `${tp.taskId}-${tp.projectId}`);
    }

    return { data: undefined, success: true };
  },

  async calculateProgress(projectId: string): Promise<ApiResponse<number>> {
    await randomDelay();
    const storage = getStorageAdapter();

    // Get all task-project links for this project
    const allTaskProjects = await storage.getRelations<TaskProject>('taskProjects', { projectId });
    const taskIds = allTaskProjects.map((tp) => tp.taskId);

    if (taskIds.length === 0) {
      return { data: 0, success: true };
    }

    // Get all tasks linked to this project
    const allTasks = await storage.getAll<Task>('tasks');
    const projectTasks = allTasks.filter((t) => taskIds.includes(t.id));

    if (projectTasks.length === 0) {
      return { data: 0, success: true };
    }

    // Calculate progress based on completed tasks
    const completedTasks = projectTasks.filter((t) => t.status === 'Done');
    const progress = Math.round((completedTasks.length / projectTasks.length) * 100);

    return { data: progress, success: true };
  },
};
