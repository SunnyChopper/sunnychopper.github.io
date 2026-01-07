import { coursesService } from './courses.service';
import { vaultItemsService } from './vault-items.service';
import { generateId } from '../../mocks/storage';
import { getFeatureConfig } from '../../lib/llm/config/feature-config-store';
import { getApiKey, hasApiKey } from '../../lib/llm/config/api-key-store';
import { createProvider } from '../../lib/llm/providers/provider-factory';
import type {
  Course,
  CourseModule,
  PreAssessmentQuestion,
  DifficultyLevel,
  ApiResponse,
} from '../../types/knowledge-vault';

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

interface GenerateLessonContentInput {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonIndex: number;
  totalLessons: number;
  difficulty: DifficultyLevel;
}

export const aiCourseGeneratorService = {
  async generatePreAssessment(
    input: GeneratePreAssessmentInput
  ): Promise<ApiResponse<PreAssessmentResult>> {
    try {
      const featureConfig = getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `You are an expert curriculum designer. Generate a pre-assessment quiz for the topic: "${input.topic}"

Target Difficulty: ${input.targetDifficulty}

Create 5-7 questions that will help identify the learner's current knowledge level and gaps. Include a mix of:
- Yes/No questions (to quickly gauge familiarity)
- Multiple choice questions (to assess depth of understanding)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Have you worked with ${input.topic} before?",
      "questionType": "yes_no",
      "options": ["Yes", "No"]
    },
    {
      "id": "q2",
      "questionText": "Which best describes your experience?",
      "questionType": "multiple_choice",
      "options": ["Never used it", "Basic projects", "Professional experience", "Expert level"]
    }
  ]
}`;

      const response = await provider.invoke([
        { role: 'user', content: prompt }
      ]);

      const parsed = JSON.parse(response);

      return {
        data: { questions: parsed.questions },
        error: null,
        success: true,
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
      const featureConfig = getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const responsesText = Object.entries(input.assessmentResponses)
        .map(([q, a]) => `${q}: ${a}`)
        .join('\n');

      const prompt = `You are an expert curriculum designer. Based on this pre-assessment, create a personalized course structure.

Topic: ${input.topic}
Target Difficulty: ${input.targetDifficulty}

Assessment Responses:
${responsesText}

Create a comprehensive course structure with:
- 3-5 modules that build progressively
- 3-6 lessons per module
- Estimated time for each lesson (in minutes)

Return ONLY valid JSON in this exact format:
{
  "courseTitle": "Complete Course Title",
  "courseDescription": "Brief description of what the course covers",
  "estimatedHours": 10,
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "What this module covers",
      "lessons": [
        {
          "title": "Lesson Title",
          "estimatedMinutes": 30
        }
      ]
    }
  ]
}`;

      const response = await provider.invoke([
        { role: 'user', content: prompt }
      ]);

      const parsed = JSON.parse(response);

      const timestamp = new Date().toISOString();
      const course: Course = {
        id: generateId(),
        title: parsed.courseTitle,
        description: parsed.courseDescription || '',
        topic: input.topic,
        difficulty: input.targetDifficulty,
        estimatedHours: parsed.estimatedHours,
        userId: 'user-1',
        createdAt: timestamp,
        updatedAt: timestamp,
        isAiGenerated: true,
      };

      const modules = parsed.modules.map((mod: any, modIndex: number) => {
        const module: CourseModule = {
          id: generateId(),
          courseId: course.id,
          title: mod.title,
          description: mod.description || null,
          moduleIndex: modIndex,
          userId: 'user-1',
          createdAt: timestamp,
        };

        const lessons = mod.lessons.map((lesson: any, lessonIndex: number) => ({
          title: lesson.title,
          estimatedMinutes: lesson.estimatedMinutes,
          lessonIndex,
        }));

        return { module, lessons };
      });

      return {
        data: { course, modules },
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating course skeleton:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate course',
        success: false,
      };
    }
  },

  async generateLessonContent(
    input: GenerateLessonContentInput
  ): Promise<ApiResponse<string>> {
    try {
      const featureConfig = getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `You are an expert educator creating lesson content for an online course.

Course: ${input.courseTitle}
Module: ${input.moduleTitle}
Lesson ${input.lessonIndex + 1} of ${input.totalLessons}: ${input.lessonTitle}
Difficulty Level: ${input.difficulty}

Create comprehensive, engaging lesson content that:
1. Starts with clear learning objectives
2. Explains concepts progressively with examples
3. Includes practical applications
4. Ends with a summary and key takeaways

Format the content in Markdown with:
- Clear headings (##, ###)
- Code examples in code blocks where applicable
- Bullet points for lists
- **Bold** for important concepts
- Real-world examples

Generate approximately ${input.difficulty === 'beginner' ? '500-800' : input.difficulty === 'intermediate' ? '800-1200' : '1200-1500'} words of educational content.`;

      const content = await provider.invoke([
        { role: 'user', content: prompt }
      ]);

      return {
        data: content,
        error: null,
        success: true,
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
