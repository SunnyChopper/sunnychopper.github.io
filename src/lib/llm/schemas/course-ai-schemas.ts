import { z } from 'zod';

/**
 * Course Strategist Agent Output Schema
 */
export const CourseStructureSchema = z.object({
  courseTitle: z.string().describe('Complete course title'),
  courseDescription: z.string().describe('Brief description of what the course covers'),
  estimatedHours: z.number().positive().describe('Total estimated hours for the course'),
  learningObjectives: z.array(z.string()).describe('Course-level learning objectives'),
  prerequisites: z.array(z.string()).describe('Prerequisites for taking this course'),
  modules: z.array(
    z.object({
      title: z.string().describe('Module title'),
      description: z.string().describe('What this module covers'),
      learningObjectives: z.array(z.string()).describe('Module-level learning objectives'),
    })
  ).describe('Module structure with titles and descriptions'),
});

export type CourseStructureOutput = z.infer<typeof CourseStructureSchema>;

/**
 * Module Architect Agent Output Schema
 */
export const ModuleLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      title: z.string().describe('Lesson title'),
      description: z.string().describe('What this lesson covers'),
      estimatedMinutes: z.number().positive().describe('Estimated time in minutes'),
      learningObjectives: z.array(z.string()).describe('Lesson-level learning objectives'),
      keyConcepts: z.array(z.string()).describe('Key concepts introduced in this lesson'),
      prerequisites: z.array(z.string()).describe('Concepts from previous lessons required for this lesson'),
    })
  ).describe('Lessons for the module'),
});

export type ModuleLessonsOutput = z.infer<typeof ModuleLessonsSchema>;

/**
 * Concept Mapper Agent Output Schema
 */
export const ConceptGraphSchema = z.object({
  concepts: z.array(
    z.object({
      id: z.string().describe('Concept identifier'),
      name: z.string().describe('Concept name'),
      introducedIn: z.string().describe('Lesson ID where concept is introduced'),
      prerequisites: z.array(z.string()).describe('Concept IDs that are prerequisites'),
      usedIn: z.array(z.string()).describe('Lesson IDs where concept is used'),
      depth: z.number().int().min(0).describe('Depth in dependency tree'),
    })
  ).describe('All concepts in the course'),
  dependencies: z.array(
    z.object({
      from: z.string().describe('Source concept ID'),
      to: z.string().describe('Target concept ID'),
      type: z.enum(['prerequisite', 'builds_on', 'extends']).describe('Type of dependency'),
    })
  ).describe('Concept dependency relationships'),
});

export type ConceptGraphOutput = z.infer<typeof ConceptGraphSchema>;

/**
 * Flow Validator Agent Output Schema
 */
export const AlignmentSchema = z.object({
  lessonTransitions: z.array(
    z.object({
      from: z.string().describe('Source lesson ID'),
      to: z.string().describe('Target lesson ID'),
      flowScore: z.number().min(0).max(1).describe('Flow quality score (0-1)'),
      gaps: z.array(z.string()).describe('Identified gaps in the transition'),
      redundancies: z.array(z.string()).describe('Identified redundancies'),
      recommendations: z.array(z.string()).describe('Recommendations for improvement'),
    })
  ).describe('Analysis of lesson-to-lesson transitions'),
  overallScore: z.number().min(0).max(1).describe('Overall alignment score (0-1)'),
  issues: z.array(
    z.object({
      type: z.enum(['gap', 'redundancy', 'prerequisite_missing', 'difficulty_jump']).describe('Type of issue'),
      severity: z.enum(['low', 'medium', 'high']).describe('Issue severity'),
      description: z.string().describe('Issue description'),
      affectedLessons: z.array(z.string()).describe('Lesson IDs affected by this issue'),
    })
  ).describe('Identified alignment issues'),
});

export type AlignmentOutput = z.infer<typeof AlignmentSchema>;

/**
 * Refinement Agent Output Schema
 * Note: Using nullable instead of optional for OpenAI extract format compatibility
 */
export const RefinementSchema = z.object({
  updatedModules: z.array(
    z.object({
      moduleId: z.string().describe('Module ID of the module to update'),
      description: z.string().nullable().describe('Updated module description, or null if not changed'),
      learningObjectives: z.array(z.string()).nullable().describe('Updated module learning objectives, or null if not changed'),
    })
  ).describe('Modules that were updated during refinement'),
  updatedLessons: z.array(
    z.object({
      lessonId: z.string().describe('Lesson ID of the lesson to update'),
      title: z.string().nullable().describe('Updated lesson title, or null if not changed'),
      description: z.string().nullable().describe('Updated lesson description, or null if not changed'),
      learningObjectives: z.array(z.string()).nullable().describe('Updated lesson learning objectives, or null if not changed'),
      keyConcepts: z.array(z.string()).nullable().describe('Updated key concepts, or null if not changed'),
      prerequisites: z.array(z.string()).nullable().describe('Updated prerequisites, or null if not changed'),
    })
  ).describe('Lessons that were updated during refinement'),
  addedLessons: z.array(
    z.object({
      moduleId: z.string().describe('Module ID where the new lesson should be added'),
      title: z.string().describe('Title of the new lesson to add'),
      description: z.string().describe('Description of what the new lesson covers'),
      estimatedMinutes: z.number().positive().describe('Estimated time in minutes for the new lesson'),
      learningObjectives: z.array(z.string()).describe('Learning objectives for the new lesson'),
      keyConcepts: z.array(z.string()).describe('Key concepts introduced in the new lesson'),
      prerequisites: z.array(z.string()).describe('Prerequisites required for the new lesson'),
      insertAfter: z.string().nullable().describe('Lesson ID to insert after, or null to append at end'),
    })
  ).describe('New lessons to add to address identified gaps'),
  removedLessons: z.array(z.string()).describe('Array of lesson IDs to remove due to redundancies'),
  changes: z.array(z.string()).describe('Summary descriptions of all changes made during refinement'),
});

export type RefinementOutput = z.infer<typeof RefinementSchema>;

/**
 * Content Generator Agent Output Schema
 */
export const LessonContentSchema = z.object({
  content: z.string().describe('Full markdown lesson content'),
  summary: z.string().describe('Brief summary of the lesson'),
  keyTakeaways: z.array(z.string()).describe('Key takeaways from the lesson'),
});

export type LessonContentOutput = z.infer<typeof LessonContentSchema>;

/**
 * Pre-Assessment Question Schema
 */
export const PreAssessmentSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().describe('Unique question identifier (e.g., "q1", "q2")'),
      questionText: z.string()
        .min(20)
        .describe('The question text - must be specific to the topic and difficulty level'),
      questionType: z.enum(['yes_no', 'multiple_choice'])
        .describe('Type of question'),
      options: z.array(z.string())
        .min(2)
        .describe('Answer options for the question'),
    })
  )
    .min(5)
    .max(7)
    .describe('Array of 5-7 assessment questions'),
});

export type PreAssessmentOutput = z.infer<typeof PreAssessmentSchema>;
