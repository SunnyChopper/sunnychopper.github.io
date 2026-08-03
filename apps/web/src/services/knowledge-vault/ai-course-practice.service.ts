import { apiClient } from '@/lib/api-client';
import { llmLogger } from '@/lib/logger';
import type { PracticeQuestion, PracticeSourceScope } from '@/types/knowledge-vault';
import type { ApiError, ApiResponse } from '@/types/api-contracts';
import { formatApiFailure } from '@/utils/api-error-formatter';
import { withNoteAIModel } from './note-ai-options';

interface AIResponse<T> {
  result: T;
  confidence: number;
  provider?: string;
  model?: string;
  cached?: boolean;
}

export interface GeneratedPracticePayload {
  title: string;
  questions: PracticeQuestion[];
  difficulty: string;
  sourceScope: PracticeSourceScope;
}

export interface GeneratedQuizPayload extends GeneratedPracticePayload {
  adaptiveContextSummary?: string;
  timeLimitMinutes?: number;
}

export interface GeneratedHomeworkPayload {
  title: string;
  prompt: string;
  deliverables: string[];
  rubric?: string | null;
  suggestedDueDate?: string | null;
  estimatedMinutes?: number;
  sourceScope: PracticeSourceScope;
}

const GENERIC_VALIDATION_MESSAGE = 'Data validation failed';

type PracticeApiErrorInput =
  | ApiError
  | { message?: string; code?: string; details?: unknown }
  | string
  | undefined;

function toApiError(err: PracticeApiErrorInput, fallback: string): ApiError | undefined {
  if (!err) return undefined;
  if (typeof err === 'string') {
    return { message: err, code: 'UNKNOWN' };
  }
  return {
    message: err.message ?? fallback,
    code: err.code ?? 'UNKNOWN',
    details: err.details,
  };
}

export function formatPracticeGenerationError(
  err: PracticeApiErrorInput,
  fallback: string
): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const apiErr = toApiError(err, fallback);
  const hasDetailList = Array.isArray(apiErr?.details) && (apiErr.details as unknown[]).length > 0;
  const formatted = formatApiFailure(apiErr, fallback);
  const isBareGeneric =
    !hasDetailList && (apiErr?.message?.trim() ?? '') === GENERIC_VALIDATION_MESSAGE;
  if (isBareGeneric) {
    return [
      GENERIC_VALIDATION_MESSAGE,
      'The AI response did not match the expected schema.',
      'Use Retry with stricter prompt to try again.',
      'Details: One or more required fields may be missing or malformed.',
    ].join('\n');
  }
  return formatted;
}

async function unwrap<T>(
  response: ApiResponse<{ data: AIResponse<T> } | null>,
  fallback: string
): Promise<{ success: boolean; data: T | null; error: string | null }> {
  const nested = response.data?.data?.result;
  if (response.success && nested) {
    return { success: true, data: nested, error: null };
  }
  const err = response.error;
  return {
    success: false,
    data: null,
    error: formatPracticeGenerationError(
      typeof err === 'string' ? err : toApiError(err, fallback),
      fallback
    ),
  };
}

type GenerateInputBase = {
  context: string;
  sourceScope: PracticeSourceScope;
  model?: string;
  stricterPrompt?: boolean;
};

function withStricterPrompt<T extends Record<string, unknown>>(
  body: T,
  stricterPrompt?: boolean
): T & { stricterPrompt?: boolean; useCache?: boolean } {
  if (!stricterPrompt) return body;
  return { ...body, stricterPrompt: true, useCache: false };
}

export const aiCoursePracticeService = {
  async generatePracticeQuestions(
    input: GenerateInputBase & {
      difficulty?: string;
      count?: number;
      title?: string;
    }
  ) {
    try {
      const response = await apiClient.post<{ data: AIResponse<GeneratedPracticePayload> }>(
        '/ai/courses/practice-questions',
        withNoteAIModel(
          withStricterPrompt(
            {
              context: input.context,
              sourceScope: input.sourceScope,
              difficulty: input.difficulty ?? 'medium',
              count: input.count ?? 5,
              title: input.title,
            },
            input.stricterPrompt
          ),
          { model: input.model }
        )
      );
      return unwrap(response, 'Failed to generate practice questions');
    } catch (err) {
      llmLogger.error('practice questions generation failed', err);
      return {
        success: false,
        data: null,
        error:
          err instanceof Error
            ? formatPracticeGenerationError(
                { message: err.message, code: 'UNKNOWN' },
                'Failed to generate practice questions'
              )
            : 'Failed to generate practice questions',
      };
    }
  },

  async generateQuiz(
    input: GenerateInputBase & {
      difficulty?: string;
      count?: number;
      title?: string;
      adaptiveContext?: string;
      timeLimitMinutes?: number;
    }
  ) {
    try {
      const response = await apiClient.post<{ data: AIResponse<GeneratedQuizPayload> }>(
        '/ai/courses/quiz',
        withNoteAIModel(
          withStricterPrompt(
            {
              context: input.context,
              sourceScope: input.sourceScope,
              difficulty: input.difficulty,
              count: input.count ?? 10,
              title: input.title,
              adaptiveContext: input.adaptiveContext,
              timeLimitMinutes: input.timeLimitMinutes ?? 30,
            },
            input.stricterPrompt
          ),
          { model: input.model }
        )
      );
      return unwrap(response, 'Failed to generate quiz');
    } catch (err) {
      llmLogger.error('quiz generation failed', err);
      return {
        success: false,
        data: null,
        error:
          err instanceof Error
            ? formatPracticeGenerationError(
                { message: err.message, code: 'UNKNOWN' },
                'Failed to generate quiz'
              )
            : 'Failed to generate quiz',
      };
    }
  },

  async generateHomework(
    input: GenerateInputBase & {
      courseProgress?: number;
      dueDays?: number;
    }
  ) {
    try {
      const response = await apiClient.post<{ data: AIResponse<GeneratedHomeworkPayload> }>(
        '/ai/courses/homework',
        withNoteAIModel(
          withStricterPrompt(
            {
              context: input.context,
              sourceScope: input.sourceScope,
              courseProgress: input.courseProgress,
              dueDays: input.dueDays ?? 3,
            },
            input.stricterPrompt
          ),
          { model: input.model }
        )
      );
      return unwrap(response, 'Failed to generate homework');
    } catch (err) {
      llmLogger.error('homework generation failed', err);
      return {
        success: false,
        data: null,
        error:
          err instanceof Error
            ? formatPracticeGenerationError(
                { message: err.message, code: 'UNKNOWN' },
                'Failed to generate homework'
              )
            : 'Failed to generate homework',
      };
    }
  },
};
