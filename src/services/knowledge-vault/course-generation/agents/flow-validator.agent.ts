import { BaseAgent } from '@/lib/llm/langgraph/base-agent';
import { AlignmentSchema, type AlignmentOutput } from '@/lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationState, CourseGenerationStateUpdate } from '../types';

/**
 * Flow Validator Agent
 * Role: Ensure logical progression and alignment
 * Checks lesson-to-lesson flow, identifies gaps and redundancies
 */
export class FlowValidatorAgent extends BaseAgent {
  constructor() {
    super('goalRefinement');
  }

  async execute(state: CourseGenerationState): Promise<CourseGenerationStateUpdate> {
    // Build context for validation
    const courseContext = `
Course: ${state.course.title}
Objectives: ${state.course.learningObjectives.join(', ')}

Modules: ${state.modules.length}
Total Lessons: ${state.modules.reduce((sum, m) => sum + m.lessons.length, 0)}
`;

    const lessonsContext = state.modules.flatMap((module, modIdx) =>
      module.lessons.map((lesson, lessonIdx) => ({
        id: lesson.id,
        moduleIndex: modIdx,
        lessonIndex: lessonIdx,
        title: lesson.title,
        description: lesson.description,
        keyConcepts: lesson.keyConcepts,
        prerequisites: lesson.prerequisites,
      }))
    );

    const systemMessage = `You are an expert curriculum validator. Your role is to analyze course structure for logical flow, identify gaps, redundancies, and prerequisite issues.`;

    const userMessage = `${courseContext}

## Course Structure:
${lessonsContext
  .map(
    (l, idx) =>
      `${idx + 1}. Module ${l.moduleIndex + 1}, Lesson ${l.lessonIndex + 1}: ${l.title}
   Concepts: ${l.keyConcepts.join(', ')}
   Prerequisites: ${l.prerequisites.join(', ')}`
  )
  .join('\n')}

Analyze the course structure and identify:
1. Lesson-to-lesson transitions (flow quality)
2. Gaps in progression
3. Redundancies
4. Missing prerequisites
5. Difficulty jumps

Provide alignment scores and specific recommendations.`;

    const messages = this.buildPrompt(systemMessage, userMessage);
    const result = (await this.invokeStructured(
      AlignmentSchema,
      messages
    )) as unknown as AlignmentOutput;

    // Convert to state format
    const issues = result.issues.map(
      (issue: {
        type: string;
        severity: string;
        description: string;
        affectedLessons: string[];
      }) => ({
        type: issue.type as 'gap' | 'redundancy' | 'prerequisite_missing' | 'difficulty_jump',
        severity: issue.severity as 'low' | 'medium' | 'high',
        description: issue.description,
        affectedLessons: issue.affectedLessons,
      })
    );

    const transitions = result.lessonTransitions.map(
      (trans: {
        from: string;
        to: string;
        flowScore: number;
        gaps: string[];
        redundancies: string[];
        recommendations: string[];
      }) => ({
        from: trans.from,
        to: trans.to,
        flowScore: trans.flowScore,
        gaps: trans.gaps,
        redundancies: trans.redundancies,
        recommendations: trans.recommendations,
      })
    );

    return {
      alignment: {
        lessonTransitions: transitions,
        overallScore: result.overallScore,
        issues,
      },
      metadata: {
        ...state.metadata,
        // CRITICAL: Preserve iterations to prevent loop reset
        iterations: state.metadata.iterations || 0,
        currentPhase: result.overallScore >= 0.8 ? 'generating' : 'refining',
        lastModified: new Date().toISOString(),
      },
    };
  }
}
