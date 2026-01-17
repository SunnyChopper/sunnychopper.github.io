import { BaseAgent } from '../../../../lib/llm/langgraph/base-agent';
import { RefinementSchema } from '../../../../lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';
import { generateId } from '../../../../mocks/storage';

/**
 * Refinement Agent
 * Role: Fix identified issues and improve alignment
 * Addresses gaps, removes redundancies, improves transitions
 */
export class RefinementAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(
    state: CourseGenerationState
  ): Promise<CourseGenerationStateUpdate> {
    const alignmentContext = `
Overall Alignment Score: ${state.alignment.overallScore}

Issues Identified:
${state.alignment.issues.map((issue, idx) => 
  `${idx + 1}. [${issue.severity}] ${issue.type}: ${issue.description}
     Affected: ${issue.affectedLessons.join(', ')}`
).join('\n')}

Lesson Transitions Needing Improvement:
${state.alignment.lessonTransitions
  .filter(t => t.flowScore < 0.7)
  .map(t => `From ${t.from} to ${t.to}: ${t.recommendations.join('; ')}`)
  .join('\n')}
`;

    const courseContext = `
Course: ${state.course.title}
Modules: ${state.modules.length}
`;

    const systemMessage = `You are an expert curriculum refiner. Your role is to fix alignment issues, address gaps, remove redundancies, and improve lesson transitions.`;

    const userMessage = `${courseContext}

${alignmentContext}

## Current Course Structure:
${state.modules.map((module, modIdx) => `
Module ${modIdx + 1}: ${module.title}
${module.lessons.map((lesson, lessonIdx) => 
  `  Lesson ${lessonIdx + 1}: ${lesson.title}
     Concepts: ${lesson.keyConcepts.join(', ')}
     Prerequisites: ${lesson.prerequisites.join(', ')}`
).join('\n')}
`).join('\n')}

Based on the alignment analysis, provide refinements:
1. Update module descriptions if needed
2. Update lesson titles, descriptions, objectives, or concepts
3. Add new lessons to address gaps
4. Remove redundant lessons
5. Improve prerequisites and concept dependencies

Focus on fixing the identified issues while maintaining the overall course structure.`;

    const messages = this.buildPrompt(systemMessage, userMessage);
    const result = await this.invokeStructured(RefinementSchema, messages);

    // Apply refinements to state
    const updatedModules = [...state.modules];

    // Update existing modules
    for (const update of result.updatedModules) {
      const module = updatedModules.find(m => m.id === update.moduleId || m.moduleIndex.toString() === update.moduleId);
      if (module) {
        if (update.description !== null && update.description !== undefined) {
          module.description = update.description;
        }
        if (update.learningObjectives !== null && update.learningObjectives !== undefined) {
          module.learningObjectives = update.learningObjectives;
        }
      }
    }

    // Update existing lessons
    for (const update of result.updatedLessons) {
      for (const module of updatedModules) {
        const lesson = module.lessons.find(l => l.id === update.lessonId);
        if (lesson) {
          if (update.title !== null && update.title !== undefined) lesson.title = update.title;
          if (update.description !== null && update.description !== undefined) lesson.description = update.description;
          if (update.learningObjectives !== null && update.learningObjectives !== undefined) lesson.learningObjectives = update.learningObjectives;
          if (update.keyConcepts !== null && update.keyConcepts !== undefined) lesson.keyConcepts = update.keyConcepts;
          if (update.prerequisites !== null && update.prerequisites !== undefined) lesson.prerequisites = update.prerequisites;
        }
      }
    }

    // Add new lessons
    for (const newLesson of result.addedLessons) {
      const module = updatedModules.find(m => m.id === newLesson.moduleId || m.moduleIndex.toString() === newLesson.moduleId);
      if (module) {
        const insertIndex = newLesson.insertAfter !== null && newLesson.insertAfter !== undefined
          ? module.lessons.findIndex(l => l.id === newLesson.insertAfter) + 1
          : module.lessons.length;

        const lesson = {
          id: generateId(),
          title: newLesson.title,
          description: newLesson.description,
          lessonIndex: insertIndex,
          estimatedMinutes: newLesson.estimatedMinutes,
          learningObjectives: newLesson.learningObjectives,
          keyConcepts: newLesson.keyConcepts,
          prerequisites: newLesson.prerequisites,
        };

        module.lessons.splice(insertIndex, 0, lesson);
        // Reindex remaining lessons
        for (let i = insertIndex + 1; i < module.lessons.length; i++) {
          module.lessons[i].lessonIndex = i;
        }
      }
    }

    // Remove redundant lessons
    for (const lessonId of result.removedLessons) {
      for (const module of updatedModules) {
        const index = module.lessons.findIndex(l => l.id === lessonId);
        if (index !== -1) {
          module.lessons.splice(index, 1);
          // Reindex remaining lessons
          for (let i = index; i < module.lessons.length; i++) {
            module.lessons[i].lessonIndex = i;
          }
        }
      }
    }

    // Ensure iterations is properly incremented
    const currentIterations = typeof state.metadata.iterations === 'number' ? state.metadata.iterations : 0;
    const newIterations = currentIterations + 1;
    
    console.log(`RefinementAgent: Incrementing iterations from ${currentIterations} to ${newIterations}`);
    
    return {
      modules: updatedModules,
      metadata: {
        ...state.metadata,
        iterations: newIterations,
        currentPhase: 'validating',
        lastModified: new Date().toISOString(),
      },
    };
  }
}
