import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Course,
  CourseModule,
  CourseLesson,
  CreateCourseInput,
  UpdateCourseInput,
  ApiResponse,
} from '../../types/knowledge-vault';

const USER_ID = 'user-1';
const COURSES_COLLECTION = 'courses';
const MODULES_COLLECTION = 'course_modules';
const VAULT_ITEMS_COLLECTION = 'vault_items';

export interface CourseWithDetails {
  course: Course;
  modules: Array<{
    module: CourseModule;
    lessons: CourseLesson[];
  }>;
}

export const coursesService = {
  async getAll(): Promise<ApiResponse<Course[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const courses = await storage.getAll<Course>(COURSES_COLLECTION);

    return {
      data: courses.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      error: null,
      success: true,
    };
  },

  async getById(id: string): Promise<ApiResponse<Course>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const course = await storage.getById<Course>(COURSES_COLLECTION, id);

    if (!course) {
      return { data: null, error: 'Course not found', success: false };
    }

    return { data: course, error: null, success: true };
  },

  async getCourseWithModulesAndLessons(courseId: string): Promise<ApiResponse<CourseWithDetails>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const course = await storage.getById<Course>(COURSES_COLLECTION, courseId);
    if (!course) {
      return { data: null, error: 'Course not found', success: false };
    }

    const allModules = await storage.getAll<CourseModule>(MODULES_COLLECTION);
    const courseModules = allModules
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.moduleIndex - b.moduleIndex);

    const allLessons = await storage.getAll<CourseLesson>(VAULT_ITEMS_COLLECTION);
    const courseLessons = allLessons.filter(l => l.courseId === courseId);

    const modulesWithLessons = courseModules.map(module => {
      const lessons = courseLessons
        .filter(l => l.moduleId === module.id)
        .sort((a, b) => a.lessonIndex - b.lessonIndex);

      return {
        module,
        lessons,
      };
    });

    return {
      data: {
        course,
        modules: modulesWithLessons,
      },
      error: null,
      success: true,
    };
  },

  async create(input: CreateCourseInput): Promise<ApiResponse<Course>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const now = new Date().toISOString();
    const course: Course = {
      id: generateId(),
      title: input.title,
      description: input.description || null,
      topic: input.topic,
      difficulty: input.difficulty || 'intermediate',
      estimatedHours: null,
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
      isAiGenerated: false,
    };

    const created = await storage.create<Course>(COURSES_COLLECTION, course.id, course);
    return { data: created, error: null, success: true };
  },

  async update(id: string, input: UpdateCourseInput): Promise<ApiResponse<Course>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const updated = await storage.update<Course>(COURSES_COLLECTION, id, {
      ...input,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return { data: null, error: 'Course not found', success: false };
    }

    return { data: updated, error: null, success: true };
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const allModules = await storage.getAll<CourseModule>(MODULES_COLLECTION);
    const courseModules = allModules.filter(m => m.courseId === id);

    for (const module of courseModules) {
      await storage.delete(MODULES_COLLECTION, module.id);
    }

    const allLessons = await storage.getAll<CourseLesson>(VAULT_ITEMS_COLLECTION);
    const courseLessons = allLessons.filter(l => l.courseId === id);

    for (const lesson of courseLessons) {
      await storage.delete(VAULT_ITEMS_COLLECTION, lesson.id);
    }

    const success = await storage.delete(COURSES_COLLECTION, id);
    return { data: success, error: null, success: true };
  },

  async createModule(courseId: string, title: string, description?: string): Promise<ApiResponse<CourseModule>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const allModules = await storage.getAll<CourseModule>(MODULES_COLLECTION);
    const courseModules = allModules.filter(m => m.courseId === courseId);
    const maxIndex = courseModules.length > 0
      ? Math.max(...courseModules.map(m => m.moduleIndex))
      : -1;

    const now = new Date().toISOString();
    const module: CourseModule = {
      id: generateId(),
      courseId,
      title,
      description: description || null,
      moduleIndex: maxIndex + 1,
      userId: USER_ID,
      createdAt: now,
    };

    const created = await storage.create<CourseModule>(MODULES_COLLECTION, module.id, module);
    return { data: created, error: null, success: true };
  },

  async getModulesByCourse(courseId: string): Promise<ApiResponse<CourseModule[]>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const allModules = await storage.getAll<CourseModule>(MODULES_COLLECTION);
    const courseModules = allModules
      .filter(m => m.courseId === courseId)
      .sort((a, b) => a.moduleIndex - b.moduleIndex);

    return { data: courseModules, error: null, success: true };
  },
};
