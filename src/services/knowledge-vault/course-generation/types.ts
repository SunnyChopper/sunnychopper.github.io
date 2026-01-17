import type { DifficultyLevel } from '@/types/knowledge-vault';

/**
 * Course Generation State - Shared global state for LangGraph workflow
 */
export interface CourseGenerationState {
  // Course-level metadata
  course: {
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    estimatedHours: number;
    learningObjectives: string[];
    prerequisites: string[];
  };

  // Module structure
  modules: Array<{
    id: string;
    title: string;
    description: string;
    moduleIndex: number;
    learningObjectives: string[];
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      lessonIndex: number;
      estimatedMinutes: number;
      learningObjectives: string[];
      keyConcepts: string[];
      prerequisites: string[]; // Concepts from previous lessons
      content?: string; // Generated later
    }>;
  }>;

  // Concept tracking
  conceptGraph: {
    concepts: Map<string, ConceptNode>;
    dependencies: Array<ConceptDependency>;
  };

  // Alignment tracking
  alignment: {
    lessonTransitions: Array<LessonTransition>;
    overallScore: number; // 0-1
    issues: Array<AlignmentIssue>;
  };

  // Generation metadata
  metadata: {
    currentPhase:
      | 'strategizing'
      | 'architecting'
      | 'mapping'
      | 'validating'
      | 'refining'
      | 'generating';
    iterations: number;
    lastModified: string;
    input?: CourseGenerationInput; // Store input for first node
  };
}

/**
 * Concept node in the dependency graph
 */
export interface ConceptNode {
  introducedIn: string; // lessonId
  prerequisites: string[]; // concept IDs
  usedIn: string[]; // lessonIds
  depth: number; // How deep in the dependency tree
}

/**
 * Concept dependency relationship
 */
export interface ConceptDependency {
  from: string; // conceptId
  to: string; // conceptId
  type: 'prerequisite' | 'builds_on' | 'extends';
}

/**
 * Lesson transition analysis
 */
export interface LessonTransition {
  from: string; // lessonId
  to: string; // lessonId
  flowScore: number; // 0-1
  gaps: string[];
  redundancies: string[];
  recommendations: string[];
}

/**
 * Alignment issue identified by validator
 */
export interface AlignmentIssue {
  type: 'gap' | 'redundancy' | 'prerequisite_missing' | 'difficulty_jump';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedLessons: string[];
}

/**
 * Input for initializing course generation state
 */
export interface CourseGenerationInput {
  topic: string;
  targetDifficulty: DifficultyLevel;
  assessmentResponses: Record<string, string>;
}

/**
 * Progress update for course generation
 */
export interface CourseGenerationProgress {
  phase: 'strategizing' | 'architecting' | 'mapping' | 'validating' | 'refining' | 'generating';
  phaseName: string;
  summary?: string;
  progress: number; // 0-100
  currentModule?: number;
  totalModules?: number;
  currentLesson?: number;
  totalLessons?: number;
}

/**
 * Partial state update from an agent
 */
export type CourseGenerationStateUpdate = Partial<CourseGenerationState>;

/**
 * Progress update for lesson content generation
 */
export interface LessonGenerationProgress {
  phase: 'analyzing' | 'structuring' | 'writing' | 'polishing';
  phaseName: string;
  summary?: string;
  progress: number; // 0-100
}
