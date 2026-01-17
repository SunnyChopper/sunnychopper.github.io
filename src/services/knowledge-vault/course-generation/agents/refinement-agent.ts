import { BaseAgent } from '@/lib/llm/langgraph/base-agent';
import { RefinementSchema } from '@/lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';
import { generateId } from '@/mocks/storage';

// Helper functions to reduce complexity
function formatAlignmentContext(state: CourseGenerationState): string {
  return `
Overall Alignment Score: ${state.alignment.overallScore}

Issues Identified:
${state.alignment.issues
  .map(
    (issue, idx) =>
      `${idx + 1}. [${issue.severity}] ${issue.type}: ${issue.description}
     Affected: ${issue.affectedLessons.join(', ')}`
  )
  .join('\n')}

Lesson Transitions Needing Improvement:
${state.alignment.lessonTransitions
  .filter((t) => t.flowScore < 0.7)
  .map((t) => `From ${t.from} to ${t.to}: ${t.recommendations.join('; ')}`)
  .join('\n')}
`;
}

function formatCourseStructure(state: CourseGenerationState): string {
  return state.modules
    .map(
      (module, modIdx) => `
Module ${modIdx + 1}: ${module.title}
${module.lessons
  .map(
    (lesson, lessonIdx) =>
      `  Lesson ${lessonIdx + 1}: ${lesson.title}
     Concepts: ${lesson.keyConcepts.join(', ')}
     Prerequisites: ${lesson.prerequisites.join(', ')}`
  )
  .join('\n')}
`
    )
    .join('\n');
}

function updateModules(
  modules: CourseGenerationState['modules'],
  updates: Array<{
    moduleId: string;
    description?: string | null;
    learningObjectives?: string[] | null;
  }>
): void {
  for (const update of updates) {
    const module = modules.find(
      (m) => m.id === update.moduleId || m.moduleIndex.toString() === update.moduleId
    );
    if (module) {
      if (update.description !== null && update.description !== undefined) {
        module.description = update.description;
      }
      if (update.learningObjectives !== null && update.learningObjectives !== undefined) {
        module.learningObjectives = update.learningObjectives;
      }
    }
  }
}

function updateLessons(
  modules: CourseGenerationState['modules'],
  updates: Array<{
    lessonId: string;
    title?: string | null;
    description?: string | null;
    learningObjectives?: string[] | null;
    keyConcepts?: string[] | null;
    prerequisites?: string[] | null;
  }>
): void {
  for (const update of updates) {
    for (const module of modules) {
      const lesson = module.lessons.find((l) => l.id === update.lessonId);
      if (lesson) {
        if (update.title !== null && update.title !== undefined) lesson.title = update.title;
        if (update.description !== null && update.description !== undefined)
          lesson.description = update.description;
        if (update.learningObjectives !== null && update.learningObjectives !== undefined)
          lesson.learningObjectives = update.learningObjectives;
        if (update.keyConcepts !== null && update.keyConcepts !== undefined)
          lesson.keyConcepts = update.keyConcepts;
        if (update.prerequisites !== null && update.prerequisites !== undefined)
          lesson.prerequisites = update.prerequisites;
      }
    }
  }
}

function reindexLessons(
  lessons: CourseGenerationState['modules'][0]['lessons'],
  startIndex: number
): void {
  for (let i = startIndex; i < lessons.length; i++) {
    lessons[i].lessonIndex = i;
  }
}

function addNewLessons(
  modules: CourseGenerationState['modules'],
  newLessons: Array<{
    moduleId: string;
    title: string;
    description: string;
    estimatedMinutes: number;
    learningObjectives: string[];
    keyConcepts: string[];
    prerequisites: string[];
    insertAfter?: string | null;
  }>
): void {
  for (const newLesson of newLessons) {
    const module = modules.find(
      (m) => m.id === newLesson.moduleId || m.moduleIndex.toString() === newLesson.moduleId
    );
    if (module) {
      const insertIndex =
        newLesson.insertAfter !== null && newLesson.insertAfter !== undefined
          ? module.lessons.findIndex((l) => l.id === newLesson.insertAfter) + 1
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
      reindexLessons(module.lessons, insertIndex + 1);
    }
  }
}

function removeLessons(modules: CourseGenerationState['modules'], lessonIds: string[]): void {
  for (const lessonId of lessonIds) {
    for (const module of modules) {
      const index = module.lessons.findIndex((l) => l.id === lessonId);
      if (index !== -1) {
        module.lessons.splice(index, 1);
        reindexLessons(module.lessons, index);
      }
    }
  }
}

/**
 * Refinement Agent
 * Role: Fix identified issues and improve alignment
 * Addresses gaps, removes redundancies, improves transitions
 */
export class RefinementAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(state: CourseGenerationState): Promise<CourseGenerationStateUpdate> {
    const alignmentContext = formatAlignmentContext(state);
    const courseContext = `
Course: ${state.course.title}
Modules: ${state.modules.length}
`;

    const systemMessage = `You are an expert curriculum refiner. Your role is to fix alignment issues, address gaps, remove redundancies, and improve lesson transitions.`;

    const userMessage = `${courseContext}

${alignmentContext}

## Current Course Structure:
${formatCourseStructure(state)}

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

    updateModules(updatedModules, result.updatedModules);
    updateLessons(updatedModules, result.updatedLessons);
    addNewLessons(updatedModules, result.addedLessons);
    removeLessons(updatedModules, result.removedLessons);

    // Ensure iterations is properly incremented
    const currentIterations =
      typeof state.metadata.iterations === 'number' ? state.metadata.iterations : 0;
    const newIterations = currentIterations + 1;

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
