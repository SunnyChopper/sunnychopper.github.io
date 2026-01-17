import type { CourseGenerationState } from './types';
import { BaseAgent } from '../../../lib/llm/langgraph/base-agent';

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
    const previousConcepts = extractConceptsFromModules(
      state.modules.slice(0, currentModuleIndex)
    );
    const conceptSummary = formatConceptSummary(
      previousConcepts,
      state.conceptGraph
    );
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
export function extractConceptsFromModules(
  modules: CourseGenerationState['modules']
): string[] {
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
export function formatModuleFull(
  module: CourseGenerationState['modules'][0]
): string {
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
  state: CourseGenerationState
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

/**
 * Get context for Content Generator agent
 * Includes previous lesson content and concept graph
 */
export function getContentGeneratorContext(
  state: CourseGenerationState,
  targetLessonId: string
): string {
  const contextParts: string[] = [];

  // Find the target lesson
  let targetLesson: CourseGenerationState['modules'][0]['lessons'][0] | null = null;
  let targetModule: CourseGenerationState['modules'][0] | null = null;
  let lessonIndex = -1;

  for (const module of state.modules) {
    const idx = module.lessons.findIndex(l => l.id === targetLessonId);
    if (idx !== -1) {
      targetLesson = module.lessons[idx];
      targetModule = module;
      lessonIndex = idx;
      break;
    }
  }

  if (!targetLesson || !targetModule) {
    return '';
  }

  // Course context
  contextParts.push(`
Course: ${state.course.title}
Course Objectives: ${state.course.learningObjectives.join(', ')}
Difficulty: ${state.course.difficulty}
`);

  // Module context
  contextParts.push(`
Module: ${targetModule.title}
${targetModule.description || ''}
Module Objectives: ${targetModule.learningObjectives.join(', ')}
`);

  // Previous lessons in same module
  if (lessonIndex > 0) {
    contextParts.push('## Previous Lessons in This Module:');
    for (let i = 0; i < lessonIndex; i++) {
      const prevLesson = targetModule.lessons[i];
      contextParts.push(`### ${prevLesson.title}`);
      if (prevLesson.description) {
        contextParts.push(prevLesson.description);
      }
      if (prevLesson.content) {
        // Include a summary or excerpt of previous lesson content
        const excerpt = prevLesson.content.substring(0, 500);
        contextParts.push(`Content excerpt: ${excerpt}...`);
      }
    }
  }

  // Concept graph context
  if (targetLesson.keyConcepts.length > 0) {
    contextParts.push(`## Key Concepts for This Lesson:`);
    for (const concept of targetLesson.keyConcepts) {
      const conceptNode = state.conceptGraph.concepts.get(concept);
      if (conceptNode) {
        const prereqs = conceptNode.prerequisites.length > 0
          ? ` (requires: ${conceptNode.prerequisites.join(', ')})`
          : '';
        contextParts.push(`- ${concept}${prereqs}`);
      } else {
        contextParts.push(`- ${concept}`);
      }
    }
  }

  // Prerequisites
  if (targetLesson.prerequisites.length > 0) {
    contextParts.push(`## Prerequisites: ${targetLesson.prerequisites.join(', ')}`);
  }

  return contextParts.join('\n\n');
}
