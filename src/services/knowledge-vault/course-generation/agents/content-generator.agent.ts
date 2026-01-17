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

  async execute(
    state: CourseGenerationState
  ): Promise<CourseGenerationStateUpdate> {
    console.log('ContentGeneratorAgent.execute: Starting', {
      modulesCount: state.modules?.length || 0,
      totalLessons: state.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0,
    });

    try {
      const updatedModules = [...state.modules];

      // Generate content for all lessons that don't have it yet
      let processedLessons = 0;
      let skippedLessons = 0;
      let errorCount = 0;

      for (const module of updatedModules) {
        for (const lesson of module.lessons) {
          if (lesson.content) {
            skippedLessons++;
            continue; // Skip if content already exists
          }

          try {
            console.log(`ContentGeneratorAgent: Generating content for lesson ${lesson.id} (${lesson.title})`);
            const context = getContentGeneratorContext(state, lesson.id);

            const systemMessage = `You are an expert educator creating comprehensive lesson content for an online course. Your content should be engaging, well-structured, and build logically on previous lessons.`;

            const userMessage = `${context}

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

Generate approximately ${state.course.difficulty === 'beginner' ? '500-800' : state.course.difficulty === 'intermediate' ? '800-1200' : '1200-1500'} words of educational content.`;

            const messages = this.buildPrompt(systemMessage, userMessage);
            console.log(`ContentGeneratorAgent: Calling invokeStructured for lesson ${lesson.id}`);
            const result = await this.invokeStructured(LessonContentSchema, messages);
            console.log(`ContentGeneratorAgent: Received result for lesson ${lesson.id}`, {
              hasResult: !!result,
              hasContent: !!result?.content,
              contentLength: result?.content?.length || 0,
            });

            if (result?.content) {
              lesson.content = result.content;
              processedLessons++;
            } else {
              console.warn(`ContentGeneratorAgent: No content in result for lesson ${lesson.id}`, result);
              errorCount++;
            }
          } catch (lessonError) {
            console.error(`ContentGeneratorAgent: Error generating content for lesson ${lesson.id}`, {
              error: lessonError,
              errorMessage: lessonError instanceof Error ? lessonError.message : String(lessonError),
              lessonId: lesson.id,
              lessonTitle: lesson.title,
            });
            errorCount++;
            // Continue with other lessons even if one fails
          }
        }
      }

      console.log('ContentGeneratorAgent.execute: Completed', {
        processedLessons,
        skippedLessons,
        errorCount,
        totalLessons: processedLessons + skippedLessons + errorCount,
      });

      const result: CourseGenerationStateUpdate = {
        modules: updatedModules,
        metadata: {
          ...state.metadata,
          currentPhase: 'generating',
          lastModified: new Date().toISOString(),
        },
      };

      console.log('ContentGeneratorAgent.execute: Returning result', {
        hasModules: !!result.modules,
        modulesCount: Array.isArray(result.modules) ? result.modules.length : 'not array',
        hasMetadata: !!result.metadata,
      });

      return result;
    } catch (error) {
      console.error('ContentGeneratorAgent.execute: Fatal error', {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
