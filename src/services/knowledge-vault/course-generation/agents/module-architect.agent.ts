import { BaseAgent } from '@/lib/llm/langgraph/base-agent';
import { ModuleLessonsSchema } from '@/lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';
import { getModuleContextOptimized } from '../context-manager';
import { generateId } from '@/mocks/storage';

/**
 * Module Architect Agent
 * Role: Design individual modules with lesson outlines
 * Processes modules sequentially with context awareness
 */
export class ModuleArchitectAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(state: CourseGenerationState): Promise<CourseGenerationStateUpdate> {
    const updatedModules = [...state.modules];

    // Process each module sequentially
    for (let i = 0; i < updatedModules.length; i++) {
      const module = updatedModules[i];

      // Skip if already has lessons
      if (module.lessons.length > 0) {
        continue;
      }

      // Get context using sliding window + concept graph approach
      const context = await getModuleContextOptimized(state, i);

      const systemMessage = `You are an expert curriculum architect. Your role is to break down modules into detailed lesson outlines that build logically on previous content.`;

      const userMessage = `${context}

## Current Module to Design:
Module ${module.moduleIndex + 1}: ${module.title}
${module.description || ''}
Module Objectives: ${module.learningObjectives.join(', ')}

Create detailed lesson outlines for this module:
- 3-6 lessons that build progressively
- Each lesson should have clear learning objectives
- Identify key concepts introduced in each lesson
- Specify prerequisites (concepts from previous lessons)
- Estimate time for each lesson (in minutes)
- Ensure lessons flow logically from one to the next

Make sure lessons build upon concepts from previous modules and lessons.`;

      const messages = this.buildPrompt(systemMessage, userMessage);
      const result = await this.invokeStructured(ModuleLessonsSchema, messages);

      // Convert to lesson structure
      const lessons = result.lessons.map((lesson, lessonIndex) => ({
        id: generateId(),
        title: lesson.title,
        description: lesson.description,
        lessonIndex,
        estimatedMinutes: lesson.estimatedMinutes,
        learningObjectives: lesson.learningObjectives,
        keyConcepts: lesson.keyConcepts,
        prerequisites: lesson.prerequisites,
      }));

      updatedModules[i] = {
        ...module,
        lessons,
      };
    }

    return {
      modules: updatedModules,
      metadata: {
        ...state.metadata,
        currentPhase: 'mapping',
        lastModified: new Date().toISOString(),
      },
    };
  }
}
