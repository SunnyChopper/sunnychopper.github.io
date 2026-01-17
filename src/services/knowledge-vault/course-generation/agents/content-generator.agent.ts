import { BaseAgent } from '../../../../lib/llm/langgraph/base-agent';
import { LessonContentSchema } from '../../../../lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';
import { getContentGeneratorContext } from '../context-manager';

/**
 * Content Generator Agent
 * Role: Generate detailed lesson content with context awareness
 * Uses full course context for coherent content generation
 */
export class ContentGeneratorAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(state: CourseGenerationState): Promise<CourseGenerationStateUpdate> {
    const updatedModules = [...state.modules];
    const stats = await this._generateContentForLessons(state, updatedModules);

    return {
      modules: updatedModules,
      metadata: {
        ...state.metadata,
        currentPhase: 'generating',
        lastModified: new Date().toISOString(),
      },
    };
  }

  private async _generateContentForLessons(
    state: CourseGenerationState,
    modules: CourseGenerationState['modules']
  ): Promise<{ processedLessons: number; skippedLessons: number; errorCount: number }> {
    let processedLessons = 0;
    let skippedLessons = 0;
    let errorCount = 0;

    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (lesson.content) {
          skippedLessons++;
          continue;
        }

        try {
          await this._generateLessonContent(state, lesson);
          processedLessons++;
        } catch (lessonError) {
          console.error(`ContentGeneratorAgent: Error generating content for lesson ${lesson.id}`, {
            error: lessonError,
            errorMessage: lessonError instanceof Error ? lessonError.message : String(lessonError),
            lessonId: lesson.id,
            lessonTitle: lesson.title,
          });
          errorCount++;
        }
      }
    }

    return { processedLessons, skippedLessons, errorCount };
  }

  private async _generateLessonContent(
    state: CourseGenerationState,
    lesson: CourseGenerationState['modules'][0]['lessons'][0]
  ): Promise<void> {
    const context = getContentGeneratorContext(state, lesson.id);
    const systemMessage = `You are an expert educator creating comprehensive lesson content for an online course. Your content should be engaging, well-structured, and build logically on previous lessons.`;
    const userMessage = this._buildLessonPrompt(context, lesson, state.course.difficulty);

    const messages = this.buildPrompt(systemMessage, userMessage);
    const result = await this.invokeStructured(LessonContentSchema, messages);

    if (result?.content) {
      lesson.content = result.content;
    } else {
      throw new Error(`No content in result for lesson ${lesson.id}`);
    }
  }

  private _buildLessonPrompt(
    context: string,
    lesson: CourseGenerationState['modules'][0]['lessons'][0],
    difficulty: string
  ): string {
    const wordCount =
      difficulty === 'beginner'
        ? '500-800'
        : difficulty === 'intermediate'
          ? '800-1200'
          : '1200-1500';

    return `${context}

## Lesson to Generate:
${lesson.title}
${lesson.description || ''}

Learning Objectives:
${lesson.learningObjectives.map((obj, idx) => `${idx + 1}. ${obj}`).join('\n')}

Key Concepts:
${lesson.keyConcepts.join(', ')}

Create comprehensive, engaging lesson content that:
1. Starts with clear learning objectives
2. Explains concepts progressively with examples
3. References previous lessons and concepts appropriately
4. Includes practical applications
5. Ends with a summary and key takeaways

Format the content in Markdown with:
- Clear headings (##, ###)
- Code examples in code blocks where applicable
- Bullet points for lists
- **Bold** for important concepts
- Real-world examples

Generate approximately ${wordCount} words of educational content.`;
  }
}
