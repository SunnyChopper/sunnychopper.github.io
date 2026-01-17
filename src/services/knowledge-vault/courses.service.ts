import { apiClient } from '../../lib/api-client';
import type {
  Course,
  CourseModule,
  CourseLesson,
  CreateCourseInput,
  UpdateCourseInput,
  ApiResponse,
} from '../../types/knowledge-vault';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CourseWithDetails {
  course: Course;
  modules: Array<{
    module: CourseModule;
    lessons: CourseLesson[];
  }>;
}

export const coursesService = {
  async getAll(): Promise<ApiResponse<Course[]>> {
    const response = await apiClient.get<BackendPaginatedResponse<Course>>('/knowledge/courses');
    if (response.success && response.data) {
      return {
        data: response.data.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        error: null,
        success: true,
      };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to fetch courses',
      success: false,
    };
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    const response = await apiClient.get<Course>(`/knowledge/courses/${id}`);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Course not found',
      success: false,
    };
  },

  async getCourseWithModulesAndLessons(courseId: string): Promise<ApiResponse<CourseWithDetails>> {
    // Backend returns course with modules and lessons in one call
    const response = await apiClient.get<CourseWithDetails>(`/knowledge/courses/${courseId}`);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Course not found',
      success: false,
    };
  },

  async create(input: CreateCourseInput): Promise<ApiResponse<Course>> {
    const response = await apiClient.post<Course>('/knowledge/courses', input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create course',
      success: false,
    };
  },

  async update(id: string, input: UpdateCourseInput): Promise<ApiResponse<Course>> {
    const response = await apiClient.patch<Course>(`/knowledge/courses/${id}`, input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to update course',
      success: false,
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    const response = await apiClient.delete<void>(`/knowledge/courses/${id}`);
    return {
      data: response.success,
      error: response.error?.message || null,
      success: response.success,
    };
  },

  async createModule(courseId: string, title: string, description?: string): Promise<ApiResponse<CourseModule>> {
    // Note: Backend may handle modules differently - this may need adjustment
    const response = await apiClient.post<CourseModule>(`/knowledge/courses/${courseId}/modules`, {
      title,
      description,
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create module',
      success: false,
    };
  },

  async getModulesByCourse(courseId: string): Promise<ApiResponse<CourseModule[]>> {
    // Modules are included in getCourseWithModulesAndLessons
    const courseResponse = await this.getCourseWithModulesAndLessons(courseId);
    if (courseResponse.success && courseResponse.data) {
      return {
        data: courseResponse.data.modules.map((m) => m.module),
        error: null,
        success: true,
      };
    }
    return {
      data: null,
      error: courseResponse.error || 'Failed to fetch modules',
      success: false,
    };
  },
};
