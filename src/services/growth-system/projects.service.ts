import { apiClient } from '@/lib/api-client';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Task,
  ProjectStatus,
  Priority,
  Area,
} from '@/types/growth-system';
import type { ApiResponse, ApiListResponse } from '@/types/api-contracts';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ProjectHealth {
  status: 'green' | 'yellow' | 'red';
  tasksCompleted: number;
  tasksTotal: number;
  percentComplete: number;
}

/**
 * Normalizes project status from API format (with spaces) to frontend format (without spaces).
 * The backend returns statuses like "On Hold" but the frontend expects "OnHold".
 */
function normalizeProjectStatus(status: string): ProjectStatus {
  const statusMap: Record<string, ProjectStatus> = {
    'On Hold': 'OnHold',
    Planning: 'Planning',
    Active: 'Active',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };

  // If already in correct format, return as-is
  if (
    statusMap[status] === undefined &&
    ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'].includes(status)
  ) {
    return status as ProjectStatus;
  }

  return statusMap[status] || (status as ProjectStatus);
}

/**
 * Denormalizes project status from frontend format (without spaces) to API format (with spaces).
 * The frontend uses statuses like "OnHold" but the backend expects "On Hold".
 */
function denormalizeProjectStatus(status: ProjectStatus): string {
  const statusMap: Record<ProjectStatus, string> = {
    Planning: 'Planning',
    Active: 'Active',
    OnHold: 'On Hold',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };

  return statusMap[status] || status;
}

/**
 * Normalizes area from API format (with spaces) to frontend format (without spaces).
 * The backend returns areas like "Day Job" but the frontend expects "DayJob".
 */
function normalizeArea(area: string): Area {
  const areaMap: Record<string, Area> = {
    'Day Job': 'DayJob',
    Health: 'Health',
    Wealth: 'Wealth',
    Love: 'Love',
    Happiness: 'Happiness',
    Operations: 'Operations',
  };

  // If already in correct format, return as-is
  if (
    areaMap[area] === undefined &&
    ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'].includes(area)
  ) {
    return area as Area;
  }

  return areaMap[area] || (area as Area);
}

/**
 * Denormalizes area from frontend format (without spaces) to API format (with spaces).
 * The frontend uses areas like "DayJob" but the backend expects "Day Job".
 */
function denormalizeArea(area: Area): string {
  const areaMap: Record<Area, string> = {
    Health: 'Health',
    Wealth: 'Wealth',
    Love: 'Love',
    Happiness: 'Happiness',
    Operations: 'Operations',
    DayJob: 'Day Job',
  };

  return areaMap[area] || area;
}

/**
 * Normalizes priority value to ensure it's a valid Priority type.
 */
function normalizePriority(priority: string | null | undefined): Priority {
  const validPriorities: Priority[] = ['P1', 'P2', 'P3', 'P4'];
  if (priority && validPriorities.includes(priority as Priority)) {
    return priority as Priority;
  }
  // Default to P3 if invalid or missing
  return 'P3';
}

/**
 * Normalizes a project object by converting status and area from API format to frontend format
 * and ensuring priority is valid.
 */
function normalizeProject(project: Project): Project {
  return {
    ...project,
    status: normalizeProjectStatus(project.status as string),
    area: normalizeArea(project.area as string),
    priority: normalizePriority(project.priority as string | null | undefined),
  };
}

export const projectsService = {
  async getAll(filters?: {
    area?: string;
    status?: string;
    priority?: string;
  }): Promise<ApiListResponse<Project>> {
    const queryParams = new URLSearchParams();
    // Convert area from frontend format (camelCase) to backend format (with spaces)
    if (filters?.area) queryParams.append('area', denormalizeArea(filters.area as Area));
    // Convert status from frontend format (camelCase) to backend format (with spaces)
    if (filters?.status)
      queryParams.append('status', denormalizeProjectStatus(filters.status as ProjectStatus));
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const endpoint = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<Project>>(endpoint);

    if (response.success && response.data) {
      // Normalize project statuses from API format (with spaces) to frontend format (without spaces)
      const normalizedProjects = response.data.data.map(normalizeProject);
      return {
        data: normalizedProjects,
        total: response.data.total,
        success: true,
      };
    }

    throw new Error(response.error?.message || 'Failed to fetch projects');
  },

  async getById(id: string): Promise<ApiResponse<Project>> {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProject(response.data),
      };
    }
    return response;
  },

  async create(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    // Prepare request body matching backend schema
    // Convert area and status from frontend format (camelCase) to backend format (with spaces)
    const requestBody: Omit<CreateProjectInput, 'area' | 'status'> & {
      area: string;
      status?: string;
    } = {
      ...input,
      area: denormalizeArea(input.area),
      status: input.status ? denormalizeProjectStatus(input.status) : undefined,
    };

    const response = await apiClient.post<Project>('/projects', requestBody);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProject(response.data),
      };
    }
    return response;
  },

  async update(id: string, input: UpdateProjectInput): Promise<ApiResponse<Project>> {
    // Convert area and status from frontend format (camelCase) to backend format (with spaces)
    const requestBody: Omit<UpdateProjectInput, 'area' | 'status'> & {
      area?: string;
      status?: string;
    } = {
      ...input,
      area: input.area ? denormalizeArea(input.area) : undefined,
      status: input.status ? denormalizeProjectStatus(input.status) : undefined,
    };

    const response = await apiClient.patch<Project>(`/projects/${id}`, requestBody);
    if (response.success && response.data) {
      return {
        ...response,
        data: normalizeProject(response.data),
      };
    }
    return response;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/projects/${id}`);
    return response;
  },

  async getLinkedTasks(projectId: string): Promise<ApiListResponse<Task>> {
    const response = await apiClient.get<BackendPaginatedResponse<Task>>(
      `/projects/${projectId}/tasks`
    );
    if (response.success && response.data) {
      return {
        data: response.data.data,
        total: response.data.total,
        success: true,
      };
    }
    throw new Error(response.error?.message || 'Failed to fetch linked tasks');
  },

  async linkTask(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(`/projects/${projectId}/tasks`, { taskId });
    return response;
  },

  async unlinkTask(projectId: string, taskId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/projects/${projectId}/tasks/${taskId}`);
    return response;
  },

  async getHealth(projectId: string): Promise<ApiResponse<ProjectHealth>> {
    const response = await apiClient.get<ProjectHealth>(`/projects/${projectId}/health`);
    return response;
  },

  async calculateProgress(projectId: string): Promise<ApiResponse<number>> {
    const healthResponse = await this.getHealth(projectId);
    if (healthResponse.success && healthResponse.data) {
      return {
        success: true,
        data: healthResponse.data.percentComplete,
      };
    }
    return {
      success: false,
      error: { code: 'FETCH_ERROR', message: 'Failed to calculate progress' },
    };
  },
};
