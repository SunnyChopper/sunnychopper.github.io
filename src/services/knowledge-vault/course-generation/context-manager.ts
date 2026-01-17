import type { CourseGenerationState } from './types';

/**
 * Context management utilities for scalable course generation.
 * Implements sliding window + concept graph strategy for handling 100+ modules.
 */

/**
 * Get optimized context for Module Architect with sliding window approach.
 * Combines:
 * 1. Course-level context (always included)
 * 2. Concept graph summary (compact, essential)
 * 3. Full context for recent modules (sliding window)
 * 4. Summaries for older modules (if beyond threshold)
 */
export async function getModuleContextOptimized(
  state: CourseGenerationState,
  currentModuleIndex: number,
  windowSize: number = 3,
  summaryThreshold: number = 5
): Promise<string> {
  const contextParts: string[] = [];

  // 1. Course-level context (always included, small)
  contextParts.push(`
Course: ${state.course.title}
Objectives: ${state.course.learningObjectives.join(', ')}
Difficulty: ${state.course.difficulty}
Prerequisites: ${state.course.prerequisites.join(', ')}
`);

  // 2. Concept graph summary (compact, essential)
  if (currentModuleIndex > 0) {
    const previousConcepts = extractConceptsFromModules(state.modules.slice(0, currentModuleIndex));
    const conceptSummary = formatConceptSummary(previousConcepts, state.conceptGraph);
    contextParts.push(`## Concepts Introduced:\n${conceptSummary}`);
  }

  // 3. Full context for recent modules (sliding window)
  const recentStart = Math.max(0, currentModuleIndex - windowSize);
  if (recentStart < currentModuleIndex) {
    contextParts.push('## Recent Modules (Full Context):');
    for (let i = recentStart; i < currentModuleIndex; i++) {
      const module = state.modules[i];
      contextParts.push(formatModuleFull(module));
    }
  }

  // 4. Summaries for older modules (if beyond threshold)
  if (currentModuleIndex > summaryThreshold) {
    const olderModules = state.modules.slice(0, recentStart);
    const summary = await generateModuleSummary(olderModules, state);
    contextParts.push(`## Earlier Modules Summary:\n${summary}`);
  }

  return contextParts.join('\n\n');
}

/**
 * Extract all concepts from modules
 */
export function extractConceptsFromModules(modules: CourseGenerationState['modules']): string[] {
  const concepts: string[] = [];
  for (const module of modules) {
    for (const lesson of module.lessons) {
      concepts.push(...lesson.keyConcepts);
    }
  }
  return [...new Set(concepts)]; // Remove duplicates
}

/**
 * Format concept graph into compact summary
 */
export function formatConceptSummary(
  concepts: string[],
  conceptGraph: CourseGenerationState['conceptGraph']
): string {
  const lines: string[] = [];
  for (const concept of concepts) {
    const conceptNode = conceptGraph.concepts.get(concept);
    if (conceptNode && conceptNode.prerequisites.length > 0) {
      lines.push(`- ${concept} (requires: ${conceptNode.prerequisites.join(', ')})`);
    } else {
      lines.push(`- ${concept}`);
    }
  }
  return lines.join('\n');
}

/**
 * Format module with full details
 */
export function formatModuleFull(module: CourseGenerationState['modules'][0]): string {
  const parts: string[] = [];
  parts.push(`### Module ${module.moduleIndex + 1}: ${module.title}`);
  if (module.description) {
    parts.push(module.description);
  }
  if (module.learningObjectives.length > 0) {
    parts.push(`Objectives: ${module.learningObjectives.join(', ')}`);
  }
  parts.push('Lessons:');
  for (const lesson of module.lessons) {
    parts.push(`  - ${lesson.title}`);
    if (lesson.description) {
      parts.push(`    ${lesson.description}`);
    }
    if (lesson.keyConcepts.length > 0) {
      parts.push(`    Concepts: ${lesson.keyConcepts.join(', ')}`);
    }
  }
  return parts.join('\n');
}

/**
 * Generate summary of older modules using LLM
 * This is called when we have too many modules to include full context
 */
async function generateModuleSummary(
  modules: CourseGenerationState['modules'],
  _state: CourseGenerationState
): Promise<string> {
  // For now, create a simple text summary
  // In a full implementation, this could use an LLM call via BaseAgent
  const summaries: string[] = [];
  for (const module of modules) {
    const lessonCount = module.lessons.length;
    const concepts = extractConceptsFromModules([module]);
    summaries.push(
      `Module ${module.moduleIndex + 1}: ${module.title} (${lessonCount} lessons, ${concepts.length} concepts)`
    );
  }
  return summaries.join('\n');
}

// Helper functions for getContentGeneratorContext
function findTargetLesson(
  state: CourseGenerationState,
  targetLessonId: string
): {
  targetLesson: CourseGenerationState['modules'][0]['lessons'][0] | null;
  targetModule: CourseGenerationState['modules'][0] | null;
  lessonIndex: number;
} {
  for (const module of state.modules) {
    const idx = module.lessons.findIndex((l) => l.id === targetLessonId);
    if (idx !== -1) {
      return {
        targetLesson: module.lessons[idx],
        targetModule: module,
        lessonIndex: idx,
      };
    }
  }
  return { targetLesson: null, targetModule: null, lessonIndex: -1 };
}

function formatCourseContext(state: CourseGenerationState): string {
  return `
Course: ${state.course.title}
Course Objectives: ${state.course.learningObjectives.join(', ')}
Difficulty: ${state.course.difficulty}
`;
}

function formatModuleContext(targetModule: CourseGenerationState['modules'][0]): string {
  return `
Module: ${targetModule.title}
${targetModule.description || ''}
Module Objectives: ${targetModule.learningObjectives.join(', ')}
`;
}

function formatPreviousLessons(
  targetModule: CourseGenerationState['modules'][0],
  lessonIndex: number
): string {
  if (lessonIndex <= 0) {
    return '';
  }

  const parts: string[] = ['## Previous Lessons in This Module:'];
  for (let i = 0; i < lessonIndex; i++) {
    const prevLesson = targetModule.lessons[i];
    parts.push(`### ${prevLesson.title}`);
    if (prevLesson.description) {
      parts.push(prevLesson.description);
    }
    if (prevLesson.content) {
      const excerpt = prevLesson.content.substring(0, 500);
      parts.push(`Content excerpt: ${excerpt}...`);
    }
  }
  return parts.join('\n');
}

function formatConceptContext(
  targetLesson: CourseGenerationState['modules'][0]['lessons'][0],
  conceptGraph: CourseGenerationState['conceptGraph']
): string {
  if (targetLesson.keyConcepts.length === 0) {
    return '';
  }

  const parts: string[] = ['## Key Concepts for This Lesson:'];
  for (const concept of targetLesson.keyConcepts) {
    const conceptNode = conceptGraph.concepts.get(concept);
    if (conceptNode && conceptNode.prerequisites.length > 0) {
      parts.push(`- ${concept} (requires: ${conceptNode.prerequisites.join(', ')})`);
    } else {
      parts.push(`- ${concept}`);
    }
  }
  return parts.join('\n');
}

function formatPrerequisites(
  targetLesson: CourseGenerationState['modules'][0]['lessons'][0]
): string {
  if (targetLesson.prerequisites.length === 0) {
    return '';
  }
  return `## Prerequisites: ${targetLesson.prerequisites.join(', ')}`;
}

/**
 * Get context for Content Generator agent
 * Includes previous lesson content and concept graph
 */
export function getContentGeneratorContext(
  state: CourseGenerationState,
  targetLessonId: string
): string {
  const { targetLesson, targetModule, lessonIndex } = findTargetLesson(state, targetLessonId);

  if (!targetLesson || !targetModule) {
    return '';
  }

  const contextParts: string[] = [formatCourseContext(state), formatModuleContext(targetModule)];

  const previousLessons = formatPreviousLessons(targetModule, lessonIndex);
  if (previousLessons) {
    contextParts.push(previousLessons);
  }

  const conceptContext = formatConceptContext(targetLesson, state.conceptGraph);
  if (conceptContext) {
    contextParts.push(conceptContext);
  }

  const prerequisites = formatPrerequisites(targetLesson);
  if (prerequisites) {
    contextParts.push(prerequisites);
  }

  return contextParts.join('\n\n');
}
