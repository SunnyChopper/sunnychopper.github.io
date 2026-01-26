import { BaseAgent } from '@/lib/llm/langgraph/base-agent';
import {
  CourseStructureSchema,
  type CourseStructureOutput,
} from '@/lib/llm/schemas/course-ai-schemas';
import type { CourseGenerationStateUpdate, CourseGenerationInput } from '../types';

/**
 * Course Strategist Agent
 * Role: High-level course design and structure
 * Creates course-level learning objectives, module breakdown, and sequencing
 */
export class CourseStrategistAgent extends BaseAgent {
  constructor() {
    super('goalRefinement'); // Using existing feature config
  }

  async execute(input: CourseGenerationInput): Promise<CourseGenerationStateUpdate> {
    const responsesText = Object.entries(input.assessmentResponses)
      .map(([q, a]) => `${q}: ${a}`)
      .join('\n');

    const systemMessage = `You are an expert curriculum designer specializing in creating comprehensive, well-structured educational courses. Your role is to design the high-level course structure and learning objectives.`;

    const userMessage = `Based on this pre-assessment, create a personalized course structure.

Topic: ${input.topic}
Target Difficulty: ${input.targetDifficulty}

Assessment Responses:
${responsesText}

Create a comprehensive course structure with:
- 3-5 modules that build progressively
- Clear course-level learning objectives
- Prerequisites for the course
- Estimated total hours

Ensure the modules are logically sequenced and build upon each other.`;

    const messages = this.buildPrompt(systemMessage, userMessage);
    const result = (await this.invokeStructured(
      CourseStructureSchema,
      messages
    )) as unknown as CourseStructureOutput;

    // Convert to state update
    const timestamp = new Date().toISOString();
    const modules = result.modules.map(
      (
        mod: { title: string; description: string; learningObjectives: string[] },
        index: number
      ) => ({
        id: `module-${index}`,
        title: mod.title,
        description: mod.description,
        moduleIndex: index,
        learningObjectives: mod.learningObjectives,
        lessons: [], // Will be populated by Module Architect
      })
    );

    return {
      course: {
        title: result.courseTitle,
        description: result.courseDescription,
        difficulty: input.targetDifficulty,
        estimatedHours: result.estimatedHours,
        learningObjectives: result.learningObjectives,
        prerequisites: result.prerequisites,
      },
      modules,
      metadata: {
        currentPhase: 'architecting',
        iterations: 0,
        lastModified: timestamp,
      },
    };
  }
}
