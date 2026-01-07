import type { Area } from './growth-system';

export type VaultItemType = 'note' | 'document' | 'course_lesson' | 'flashcard';
export type VaultItemStatus = 'draft' | 'active' | 'archived';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type QuestionType = 'yes_no' | 'multiple_choice';

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: string | null;
  tags: string[];
  area: Area;
  status: VaultItemStatus;
  searchableText: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string | null;
}

export interface Note extends VaultItem {
  type: 'note';
  linkedItems: string[];
  sourceUrl: string | null;
}

export interface Document extends VaultItem {
  type: 'document';
  fileUrl: string | null;
  fileType: string | null;
  pageCount: number | null;
}

export interface CourseLesson extends VaultItem {
  type: 'course_lesson';
  courseId: string;
  moduleId: string;
  lessonIndex: number;
  estimatedMinutes: number | null;
  completedAt: string | null;
  aiGenerated: boolean;
}

export interface Flashcard extends VaultItem {
  type: 'flashcard';
  front: string;
  back: string;
  sourceItemId: string | null;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  difficulty: DifficultyLevel;
  estimatedHours: number | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  moduleIndex: number;
  userId: string;
  createdAt: string;
}

export interface PreAssessmentQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
}

export interface PreAssessment {
  id: string;
  courseId: string;
  questions: PreAssessmentQuestion[];
  userResponses: Record<string, string>;
  completedAt: string | null;
}

export interface ConceptConnection {
  id: string;
  sourceItemId: string;
  targetItemId: string;
  synthesisInsight: string;
  connectionStrength: number;
  userId: string;
  createdAt: string;
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  tags?: string[];
  area: Area;
  linkedItems?: string[];
  sourceUrl?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  area?: Area;
  status?: VaultItemStatus;
  linkedItems?: string[];
  sourceUrl?: string;
}

export interface CreateDocumentInput {
  title: string;
  content?: string;
  tags?: string[];
  area: Area;
  fileUrl?: string;
  fileType?: string;
  pageCount?: number;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  tags?: string[];
  area?: Area;
  status?: VaultItemStatus;
  fileUrl?: string;
  fileType?: string;
  pageCount?: number;
}

export interface CreateFlashcardInput {
  title: string;
  front: string;
  back: string;
  tags?: string[];
  area: Area;
  sourceItemId?: string;
}

export interface UpdateFlashcardInput {
  title?: string;
  front?: string;
  back?: string;
  tags?: string[];
  area?: Area;
  status?: VaultItemStatus;
  sourceItemId?: string;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  topic: string;
  difficulty?: DifficultyLevel;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
}

export interface GenerateCourseSkeletonInput {
  topic: string;
  assessmentResponses: Record<string, string>;
  targetDifficulty: DifficultyLevel;
}

export interface GenerateLessonContentInput {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  moduleContext: string;
}

export interface CreateConnectionInput {
  sourceItemId: string;
  targetItemId: string;
  synthesisInsight: string;
  connectionStrength: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface VaultItemFilters {
  type?: VaultItemType;
  search?: string;
  area?: Area;
  tags?: string[];
  status?: VaultItemStatus;
}
