import { apiClient } from '../../lib/api-client';
import type {
  VaultItem,
  Note,
  Document,
  Flashcard,
  CourseLesson,
  VaultItemType,
  VaultItemStatus,
  VaultItemFilters,
  CreateNoteInput,
  UpdateNoteInput,
  CreateDocumentInput,
  UpdateDocumentInput,
  CreateFlashcardInput,
  UpdateFlashcardInput,
  ApiResponse,
} from '../../types/knowledge-vault';
import type { Area } from '../../types/growth-system';

interface CreateCourseLessonInput {
  title: string;
  courseId: string;
  moduleId: string;
  lessonIndex: number;
  estimatedMinutes: number;
  area: Area;
  tags: string[];
  content?: string;
}

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const vaultItemsService = {
  async getAll(filters?: VaultItemFilters): Promise<ApiResponse<VaultItem[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.area) queryParams.append('area', filters.area);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => queryParams.append('tags', tag));
    }

    const endpoint = `/knowledge/notes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<BackendPaginatedResponse<VaultItem>>(endpoint);

    if (response.success && response.data) {
      return {
        data: response.data.data.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
        error: null,
        success: true,
      };
    }

    return {
      data: null,
      error: response.error?.message || 'Failed to fetch items',
      success: false,
    };
  },

  async getById(id: string): Promise<ApiResponse<VaultItem>> {
    // Try notes endpoint first, then flashcards if needed
    const response = await apiClient.get<VaultItem>(`/knowledge/notes/${id}`);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Item not found',
      success: false,
    };
  },

  async getByType(type: VaultItemType): Promise<ApiResponse<VaultItem[]>> {
    return this.getAll({ type });
  },

  async search(query: string): Promise<ApiResponse<VaultItem[]>> {
    return this.getAll({ search: query });
  },

  async createNote(input: CreateNoteInput): Promise<ApiResponse<Note>> {
    const response = await apiClient.post<Note>('/knowledge/notes', input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create note',
      success: false,
    };
  },

  async createDocument(input: CreateDocumentInput): Promise<ApiResponse<Document>> {
    // Documents may use notes endpoint or separate endpoint
    const response = await apiClient.post<Document>('/knowledge/notes', {
      ...input,
      type: 'document',
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create document',
      success: false,
    };
  },

  async createFlashcard(input: CreateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    const response = await apiClient.post<Flashcard>('/knowledge/flashcards', {
      front: input.front,
      back: input.back,
      tags: input.tags || [],
      area: input.area,
      sourceItemId: input.sourceItemId,
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create flashcard',
      success: false,
    };
  },

  async update(id: string, updates: Partial<VaultItem>): Promise<ApiResponse<VaultItem>> {
    // Determine endpoint based on type or try notes first
    const endpoint =
      updates.type === 'flashcard' ? `/knowledge/flashcards/${id}` : `/knowledge/notes/${id}`;
    const response = await apiClient.patch<VaultItem>(endpoint, updates);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to update item',
      success: false,
    };
  },

  async updateNote(id: string, input: UpdateNoteInput): Promise<ApiResponse<Note>> {
    const response = await this.update(id, input);
    return response as ApiResponse<Note>;
  },

  async updateDocument(id: string, input: UpdateDocumentInput): Promise<ApiResponse<Document>> {
    const response = await this.update(id, input);
    return response as ApiResponse<Document>;
  },

  async updateFlashcard(id: string, input: UpdateFlashcardInput): Promise<ApiResponse<Flashcard>> {
    const response = await apiClient.patch<Flashcard>(`/knowledge/flashcards/${id}`, input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to update flashcard',
      success: false,
    };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    // Try notes endpoint first
    const response = await apiClient.delete<void>(`/knowledge/notes/${id}`);
    return {
      data: response.success,
      error: response.error?.message || null,
      success: response.success,
    };
  },

  async markAccessed(id: string): Promise<ApiResponse<VaultItem>> {
    const response = await this.update(id, {
      lastAccessedAt: new Date().toISOString(),
    });
    return response;
  },

  async createCourseLesson(input: CreateCourseLessonInput): Promise<ApiResponse<CourseLesson>> {
    // Course lessons may be created via courses endpoint
    const response = await apiClient.post<CourseLesson>(
      `/knowledge/courses/${input.courseId}/lessons`,
      {
        title: input.title,
        moduleId: input.moduleId,
        lessonIndex: input.lessonIndex,
        estimatedMinutes: input.estimatedMinutes,
        area: input.area,
        tags: input.tags,
        content: input.content,
      }
    );
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create lesson',
      success: false,
    };
  },

  async markLessonComplete(lessonId: string): Promise<ApiResponse<CourseLesson>> {
    // This may need to be done via course endpoint
    const response = await apiClient.patch<CourseLesson>(`/knowledge/notes/${lessonId}`, {
      completedAt: new Date().toISOString(),
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to mark lesson complete',
      success: false,
    };
  },
};
