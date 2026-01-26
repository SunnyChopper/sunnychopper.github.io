import { apiClient } from '@/lib/api-client';
import { coursesService } from './courses.service';
import { vaultItemsService } from './vault-items.service';
import { generateId } from '@/mocks/storage';
import type {
  Course,
  CourseModule,
  PreAssessmentQuestion,
  DifficultyLevel,
  ApiResponse,
} from '@/types/knowledge-vault';
import {
  buildCourseGenerationGraph,
  setProgressCallback,
  setStoredInput,
  getStoredInput,
  setGlobalStateCache,
} from './course-generation/course-graph';
import type {
  CourseGenerationState,
  CourseGenerationProgress,
  LessonGenerationProgress,
  CourseGenerationInput,
  ConceptNode,
} from './course-generation/types';
interface AIResponse<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  provider?: string;
  model?: string;
  cached?: boolean;
}

interface GeneratePreAssessmentInput {
  topic: string;
  targetDifficulty: DifficultyLevel;
}

interface PreAssessmentResult {
  questions: PreAssessmentQuestion[];
}

interface GenerateCourseSkeletonInput {
  topic: string;
  assessmentResponses: Record<string, string>;
  targetDifficulty: DifficultyLevel;
  onProgress?: (progress: CourseGenerationProgress) => void;
}

interface CourseSkeletonResult {
  course: Course;
  modules: Array<{
    module: CourseModule;
    lessons: Array<{
      title: string;
      estimatedMinutes: number;
    }>;
  }>;
}

/**
 * Convert LangGraph state to CourseSkeletonResult format
 */
function convertStateToSkeletonResult(state: CourseGenerationState): CourseSkeletonResult {
  // Validate state has required data
  if (!state.course || !state.course.title) {
    throw new Error('Course generation failed: Course data is missing');
  }

  if (!state.modules || !Array.isArray(state.modules) || state.modules.length === 0) {
    throw new Error(
      'Course generation failed: No modules were generated. The course structure could not be created.'
    );
  }

  const timestamp = new Date().toISOString();

  const course: Course = {
    id: generateId(),
    title: state.course.title,
    description: state.course.description || '',
    topic: '', // Will be set from input
    difficulty: state.course.difficulty,
    estimatedHours: state.course.estimatedHours,
    userId: 'user-1',
    createdAt: timestamp,
    updatedAt: timestamp,
    isAiGenerated: true,
  };

  const modules = state.modules.map((mod) => {
    if (!mod.lessons || !Array.isArray(mod.lessons)) {
      throw new Error(`Course generation failed: Module "${mod.title}" has no lessons`);
    }

    const module: CourseModule = {
      id: mod.id,
      courseId: course.id,
      title: mod.title,
      description: mod.description || null,
      moduleIndex: mod.moduleIndex,
      userId: 'user-1',
      createdAt: timestamp,
    };

    const lessons = mod.lessons.map((lesson) => ({
      title: lesson.title,
      estimatedMinutes: lesson.estimatedMinutes,
    }));

    return { module, lessons };
  });

  return { course, modules };
}

interface GenerateLessonContentInput {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonIndex: number;
  totalLessons: number;
  difficulty: DifficultyLevel;
  onProgress?: (progress: LessonGenerationProgress) => void;
}

export const aiCourseGeneratorService = {
  async generatePreAssessment(
    input: GeneratePreAssessmentInput
  ): Promise<ApiResponse<PreAssessmentResult>> {
    try {
      const response = await apiClient.post<{ data: AIResponse<PreAssessmentResult> }>(
        '/ai/courses/pre-assessment',
        input
      );

      if (response.success && response.data) {
        return {
          data: response.data.data.result,
          error: null,
          success: true,
        };
      }

      return {
        data: null,
        error: response.error?.message || 'Failed to generate assessment',
        success: false,
      };
    } catch (error) {
      console.error('Error generating pre-assessment:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate assessment',
        success: false,
      };
    }
  },

  async generateCourseSkeleton(
    input: GenerateCourseSkeletonInput
  ): Promise<ApiResponse<CourseSkeletonResult>> {
    try {
      if (input.onProgress) {
        input.onProgress({
          phase: 'generating',
          phaseName: 'Generating Course Structure',
          summary: 'Requesting course outline from backend...',
          progress: 10,
        });
      }

      const response = await apiClient.post<{ data: AIResponse<CourseSkeletonResult> }>(
        '/ai/courses/skeleton',
        input
      );

      if (response.success && response.data) {
        if (input.onProgress) {
          input.onProgress({
            phase: 'generating',
            phaseName: 'Finalizing',
            summary: 'Course outline generated.',
            progress: 100,
          });
        }
        return {
          data: response.data.data.result,
          error: null,
          success: true,
        };
      }

      return {
        data: null,
        error: response.error?.message || 'Failed to generate course',
        success: false,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate course. Please check your LLM configuration and try again.';

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }
  },

  _createSerializableState(
    initialState: CourseGenerationState,
    courseInput: CourseGenerationInput
  ): Record<string, unknown> {
    if (!Array.isArray(initialState.modules)) {
      initialState.modules = [];
    }

    return {
      course: initialState.course,
      modules: initialState.modules,
      conceptGraph: {
        concepts: Object.fromEntries(initialState.conceptGraph.concepts),
        dependencies: initialState.conceptGraph.dependencies,
      },
      alignment: initialState.alignment,
      metadata: {
        ...initialState.metadata,
        input: courseInput,
      },
    };
  },

  _validateGraphResult(result: unknown): CourseGenerationState {
    if (!result) {
      const storedInput = getStoredInput();
      if (storedInput) {
        throw new Error(
          'Course generation failed: Graph execution returned no state. State was lost during execution.'
        );
      }
      throw new Error('Course generation failed: Graph execution returned no state');
    }

    if (typeof result !== 'object') {
      throw new Error('Course generation failed: Graph execution returned invalid state type');
    }

    const finalState = result as CourseGenerationState;

    if (!finalState.modules || !Array.isArray(finalState.modules)) {
      finalState.modules = [];
    }

    if (finalState.conceptGraph?.concepts && !(finalState.conceptGraph.concepts instanceof Map)) {
      finalState.conceptGraph.concepts = new Map(
        Object.entries(finalState.conceptGraph.concepts as Record<string, ConceptNode>)
      );
    }

    return finalState;
  },

  async _executeGraph(
    initialState: CourseGenerationState,
    courseInput: CourseGenerationInput
  ): Promise<CourseGenerationState> {
    const graph = buildCourseGenerationGraph();
    const serializableState = this._createSerializableState(initialState, courseInput);

    try {
      const result = await graph.invoke(serializableState);
      return this._validateGraphResult(result);
    } catch (graphError) {
      throw new Error(
        `Course generation failed during graph execution: ${graphError instanceof Error ? graphError.message : 'Unknown error'}`
      );
    }
  },

  _cleanupResources(): void {
    setProgressCallback(() => {});
    setStoredInput(null as unknown as CourseGenerationInput);
    setGlobalStateCache(null);
  },

  _convertAndFinalizeState(finalState: CourseGenerationState, topic: string): CourseSkeletonResult {
    if (!finalState.course || !finalState.modules) {
      throw new Error(
        'Course generation failed: Graph execution returned incomplete state. Missing course or modules data.'
      );
    }

    try {
      const skeletonResult = convertStateToSkeletonResult(finalState);
      skeletonResult.course.topic = topic;
      return skeletonResult;
    } catch (conversionError) {
      throw conversionError instanceof Error
        ? conversionError
        : new Error('Failed to convert generated course state to skeleton format');
    }
  },
  async generateLessonContent(input: GenerateLessonContentInput): Promise<ApiResponse<string>> {
    try {
      if (input.onProgress) {
        input.onProgress({
          phase: 'writing',
          phaseName: 'Generating Lesson',
          summary: 'Requesting lesson content from backend...',
          progress: 10,
        });
      }

      const response = await apiClient.post<{ data: AIResponse<string> }>(
        '/ai/courses/lesson',
        input
      );

      if (response.success && response.data) {
        if (input.onProgress) {
          input.onProgress({
            phase: 'polishing',
            phaseName: 'Complete',
            summary: 'Lesson generation complete.',
            progress: 100,
          });
        }
        return {
          data: response.data.data.result,
          error: null,
          success: true,
        };
      }

      return {
        data: null,
        error: response.error?.message || 'Failed to generate lesson content',
        success: false,
      };
    } catch (error) {
      console.error('Error generating lesson content:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate lesson',
        success: false,
      };
    }
  },

  async createCourseFromSkeleton(skeleton: CourseSkeletonResult): Promise<ApiResponse<Course>> {
    try {
      const courseResponse = await coursesService.create({
        title: skeleton.course.title,
        description: skeleton.course.description || undefined,
        topic: skeleton.course.topic,
        difficulty: skeleton.course.difficulty,
      });

      if (!courseResponse.success || !courseResponse.data) {
        throw new Error('Failed to create course');
      }

      const course = courseResponse.data;

      for (const { module, lessons } of skeleton.modules) {
        const moduleResponse = await coursesService.createModule(
          course.id,
          module.title,
          module.description || undefined
        );

        if (!moduleResponse.success || !moduleResponse.data) {
          continue;
        }

        const createdModule = moduleResponse.data;

        for (let i = 0; i < lessons.length; i++) {
          const lessonData = lessons[i];

          await vaultItemsService.createCourseLesson({
            title: lessonData.title,
            courseId: course.id,
            moduleId: createdModule.id,
            lessonIndex: i,
            estimatedMinutes: lessonData.estimatedMinutes,
            area: 'Operations',
            tags: [course.topic.toLowerCase()],
          });
        }
      }

      return {
        data: course,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error creating course from skeleton:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create course',
        success: false,
      };
    }
  },
};
