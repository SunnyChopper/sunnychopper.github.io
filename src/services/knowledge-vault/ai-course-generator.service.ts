import { coursesService } from './courses.service';
import { vaultItemsService } from './vault-items.service';
import { generateId } from '@/mocks/storage';
import { getFeatureConfig } from '@/lib/llm/config/feature-config-store';
import { getApiKey, hasApiKey } from '@/lib/llm/config/api-key-store';
import { createProvider } from '@/lib/llm/providers/provider-factory';
import type {
  Course,
  CourseModule,
  PreAssessmentQuestion,
  DifficultyLevel,
  ApiResponse,
} from '@/types/knowledge-vault';
import {
  buildCourseGenerationGraph,
  initializeState,
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
import { PreAssessmentSchema } from '@/lib/llm/schemas/course-ai-schemas';

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

interface GenerateLessonContentInput {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonIndex: number;
  totalLessons: number;
  difficulty: DifficultyLevel;
  onProgress?: (progress: LessonGenerationProgress) => void;
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

      // Build difficulty-specific guidance
      const difficultyGuidance = {
        beginner: `Questions should assess:
- Basic definitions and fundamental concepts
- Simple applications and use cases
- Entry-level understanding
- Examples: "What is the primary purpose of X?", "Which of these is a basic component of Y?"`,

        intermediate: `Questions should assess:
- Practical scenarios and real-world applications
- Common patterns and best practices
- Moderate complexity problem-solving
- Examples: "In scenario X, which approach would be most effective?", "What is the typical workflow for Y?"`,

        advanced: `Questions MUST assess deep, sophisticated knowledge appropriate for advanced practitioners:

REQUIRED ELEMENTS:
- Domain-specific terminology, jargon, and technical vocabulary specific to "${input.topic}"
- Theoretical frameworks, models, and academic concepts relevant to the field
- Applied psychology, behavioral science, or cognitive principles (where applicable)
- High-level strategic thinking and nuanced understanding
- Complex interrelationships between concepts
- Critical analysis of trade-offs, limitations, and edge cases
- Questions that assume the learner already knows the fundamentals

QUESTION STYLE:
- Use precise technical terminology (e.g., "cognitive dissonance", "brand equity", "value proposition", "positioning strategy")
- Reference specific frameworks, models, or theories by name
- Test understanding of underlying psychological, economic, or strategic principles
- Require synthesis of multiple concepts
- Avoid simple factual recall - focus on application and analysis
- Questions should challenge someone who already understands the basics

EXAMPLES OF APPROPRIATE ADVANCED QUESTIONS:
- "How does the concept of [specific framework/model] apply to [complex scenario] in [topic]?"
- "What are the psychological mechanisms underlying [advanced concept] in [topic]?"
- "Which [domain-specific] strategy would be most effective when [complex constraint/scenario]?"
- "How do [concept A] and [concept B] interact to create [advanced outcome] in [topic]?"
- "What are the limitations of [specific approach] when applied to [edge case] in [topic]?"

AVOID:
- Simple yes/no questions about basic facts
- Questions with "All of the above" as an option (too easy)
- Generic questions that could apply to any topic
- Questions that test only surface-level knowledge`,

        expert: `Questions MUST assess expert-level mastery and deep theoretical knowledge:

REQUIRED ELEMENTS:
- Advanced domain-specific terminology and cutting-edge concepts
- Deep theoretical understanding of frameworks, models, and academic research
- Sophisticated application of psychology, behavioral economics, or strategic theory
- Ability to critique, synthesize, and innovate on existing approaches
- Understanding of historical context, evolution, and future directions
- Questions that test ability to design novel solutions to complex problems

QUESTION STYLE:
- Use advanced technical vocabulary and reference cutting-edge research
- Test ability to critique and improve upon existing frameworks
- Require synthesis of multiple advanced concepts across disciplines
- Focus on optimization, innovation, and architectural-level thinking
- Questions should challenge even experienced practitioners
- Test understanding of why approaches work, not just what they are

EXAMPLES OF APPROPRIATE EXPERT QUESTIONS:
- "How would you modify [specific advanced framework] to address [novel constraint] in [topic]?"
- "What are the theoretical limitations of [advanced model] when applied to [complex scenario]?"
- "How do [concept A], [concept B], and [concept C] interact to create [sophisticated outcome]?"
- "Design an approach that synthesizes [framework X] and [framework Y] to solve [complex problem]"
- "Critically analyze the trade-offs between [advanced approach A] and [advanced approach B] in [context]"

AVOID:
- Any questions that could be answered by someone with intermediate knowledge
- Simple multiple choice with obvious answers
- Questions that test memorization rather than deep understanding
- Generic scenarios that don't require expert-level analysis`,
      };

      const guidance =
        difficultyGuidance[input.targetDifficulty] || difficultyGuidance.intermediate;

      const isAdvancedLevel =
        input.targetDifficulty === 'advanced' || input.targetDifficulty === 'expert';

      const prompt = `You are an expert curriculum designer specializing in creating meaningful, topic-specific assessments.

Generate a pre-assessment quiz for the topic: "${input.topic}"
Target Difficulty Level: ${input.targetDifficulty}

CRITICAL REQUIREMENTS:
1. All questions MUST be specific to the topic "${input.topic}" and assess actual knowledge, not just familiarity
2. DO NOT include generic questions like:
   - "Have you worked with ${input.topic} before?"
   - "Which best describes your experience?"
   - "How familiar are you with ${input.topic}?"
   - Any questions that ask about experience level rather than knowledge
3. Questions must match the ${input.targetDifficulty} difficulty level EXACTLY - ${isAdvancedLevel ? 'this is an ADVANCED/EXPERT level course, so questions must be sophisticated and challenging' : 'ensure questions are appropriate for this level'}
4. Each question should test understanding of specific concepts, principles, or applications related to the topic
${isAdvancedLevel ? `5. FOR ${input.targetDifficulty.toUpperCase()} LEVEL: Questions MUST use domain-specific terminology, reference theoretical frameworks, and test deep understanding. Simple factual questions are UNACCEPTABLE.` : ''}

${guidance}

Question Guidelines:
- Create 5-7 questions total
${isAdvancedLevel ? '- For advanced/expert levels: Prefer multiple choice over yes/no questions. Yes/no questions should only be used for complex theoretical propositions that require deep knowledge to answer correctly' : '- Mix of yes/no and multiple choice questions'}
- Multiple choice questions should have 3-4 options that test nuanced understanding
${isAdvancedLevel ? '- Each option should require domain knowledge to distinguish - avoid obviously wrong answers' : ''}
- Each question should be at least 20 characters long
- Questions must be directly related to the topic and assess real knowledge
- Avoid vague or generic phrasing
${isAdvancedLevel ? '- Use precise technical terminology specific to the field of "' + input.topic + '"' : ''}
${isAdvancedLevel ? '- Reference specific frameworks, models, theories, or concepts by name where appropriate' : ''}
${isAdvancedLevel ? '- Test understanding of underlying principles, not just surface-level facts' : ''}
${isAdvancedLevel ? '- AVOID: Simple yes/no questions about basic facts, questions with "All of the above" options, or questions that could be answered by someone with only intermediate knowledge' : ''}

Focus on creating questions that will accurately identify:
- What the learner already knows about the topic
- Specific knowledge gaps
- Areas where the course should focus
- The learner's current depth of understanding at the ${input.targetDifficulty} level
${isAdvancedLevel ? '- For advanced/expert: Whether the learner can handle sophisticated concepts, theoretical frameworks, and complex applications' : ''}`;

      const result = await provider.invokeStructured(PreAssessmentSchema, [
        { role: 'user', content: prompt },
      ]);

      return {
        data: { questions: result.questions },
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
      this._validateLLMConfiguration();
      this._setupProgressCallback(input.onProgress);

      const courseInput = this._prepareCourseInput(input);
      const initialState = this._initializeAndValidateState(courseInput);

      const finalState = await this._executeGraph(initialState, courseInput);

      this._cleanupResources();

      const skeletonResult = this._convertAndFinalizeState(finalState, input.topic);

      return {
        data: skeletonResult,
        error: null,
        success: true,
      };
    } catch (error) {
      this._cleanupResources();
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

  _validateLLMConfiguration(): void {
    const featureConfig = getFeatureConfig('goalRefinement');
    if (!featureConfig || !hasApiKey(featureConfig.provider)) {
      throw new Error('LLM not configured. Please configure in Settings.');
    }
  },

  _setupProgressCallback(onProgress?: (progress: CourseGenerationProgress) => void): void {
    if (onProgress) {
      setProgressCallback(onProgress);
    }
  },

  _prepareCourseInput(input: GenerateCourseSkeletonInput): CourseGenerationInput {
    const courseInput: CourseGenerationInput = {
      topic: input.topic,
      targetDifficulty: input.targetDifficulty,
      assessmentResponses: input.assessmentResponses,
    };
    setStoredInput(courseInput);
    return courseInput;
  },

  _initializeAndValidateState(courseInput: CourseGenerationInput): CourseGenerationState {
    setGlobalStateCache(null);
    const initialState = initializeState(courseInput);

    if (!initialState.metadata || !initialState.metadata.input) {
      throw new Error('Initial state is missing required metadata or input');
    }

    setGlobalStateCache(initialState);
    return initialState;
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
      const featureConfig = getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      // Phase 1: Analyzing
      if (input.onProgress) {
        input.onProgress({
          phase: 'analyzing',
          phaseName: 'Analyzing Lesson Context',
          summary: 'Understanding lesson requirements and context...',
          progress: 10,
        });
      }

      // Simulate analysis phase
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Phase 2: Structuring
      if (input.onProgress) {
        input.onProgress({
          phase: 'structuring',
          phaseName: 'Structuring Content',
          summary: 'Organizing lesson structure and learning objectives...',
          progress: 30,
        });
      }

      // Simulate structuring phase
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Phase 3: Writing
      if (input.onProgress) {
        input.onProgress({
          phase: 'writing',
          phaseName: 'Writing Lesson Content',
          summary: 'Generating comprehensive lesson content...',
          progress: 50,
        });
      }

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

      const content = await provider.invoke([{ role: 'user', content: prompt }]);

      // Phase 4: Polishing
      if (input.onProgress) {
        input.onProgress({
          phase: 'polishing',
          phaseName: 'Polishing Content',
          summary: 'Finalizing and refining lesson content...',
          progress: 90,
        });
      }

      // Simulate polishing phase
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (input.onProgress) {
        input.onProgress({
          phase: 'polishing',
          phaseName: 'Polishing Content',
          summary: 'Lesson content generated successfully!',
          progress: 100,
        });
      }

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
