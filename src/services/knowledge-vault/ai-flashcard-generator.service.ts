import { apiClient } from '@/lib/api-client';
import { vaultItemsService } from './vault-items.service';
import { generateId } from '@/mocks/storage';
import type { ApiResponse, Flashcard } from '@/types/knowledge-vault';
import { spacedRepetitionService } from './spaced-repetition.service';

interface GenerateFlashcardsInput {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
  count?: number;
}

interface FlashcardData {
  front: string;
  back: string;
}

interface AIResponse<T> {
  result: T;
  confidence: number;
  reasoning?: string;
  provider?: string;
  model?: string;
  cached?: boolean;
}

export const aiFlashcardGeneratorService = {
  async generateFromLesson(input: GenerateFlashcardsInput): Promise<ApiResponse<Flashcard[]>> {
    try {
      const response = await apiClient.post<{ data: AIResponse<FlashcardData[]> }>(
        '/ai/flashcards/from-lesson',
        {
          lessonId: input.lessonId,
          lessonTitle: input.lessonTitle,
          lessonContent: input.lessonContent,
          count: input.count,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to generate flashcards');
      }

      const flashcardsData = response.data.data.result || [];

      const flashcards: Flashcard[] = [];
      const now = new Date().toISOString();

      for (const cardData of flashcardsData) {
        const flashcard: Flashcard = {
          id: generateId(),
          type: 'flashcard',
          title: cardData.front.substring(0, 100),
          content: null,
          tags: [],
          area: 'Operations',
          status: 'active',
          searchableText: `${cardData.front} ${cardData.back}`.toLowerCase(),
          front: cardData.front,
          back: cardData.back,
          sourceItemId: input.lessonId,
          nextReviewDate: now,
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          userId: 'user-1',
          createdAt: now,
          updatedAt: now,
          lastAccessedAt: null,
        };

        const createResponse = await vaultItemsService.createFlashcard({
          title: flashcard.title,
          front: flashcard.front,
          back: flashcard.back,
          area: flashcard.area,
          tags: flashcard.tags,
          sourceItemId: input.lessonId,
        });

        if (createResponse.success && createResponse.data) {
          flashcards.push(createResponse.data);
        }
      }

      return {
        data: flashcards,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
        success: false,
      };
    }
  },

  async generateFromText(
    title: string,
    content: string,
    count: number = 5
  ): Promise<ApiResponse<FlashcardData[]>> {
    try {
      const response = await apiClient.post<{ data: AIResponse<FlashcardData[]> }>(
        '/ai/flashcards/from-text',
        {
          title,
          content,
          count,
        }
      );

      if (response.success && response.data) {
        return {
          data: response.data.data.result || [],
          error: null,
          success: true,
        };
      }

      return {
        data: null,
        error: response.error?.message || 'Failed to generate flashcards',
        success: false,
      };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to generate flashcards',
        success: false,
      };
    }
  },

  async reviewFlashcard(flashcardId: string, quality: number): Promise<ApiResponse<Flashcard>> {
    try {
      const flashcardResponse = await vaultItemsService.getById(flashcardId);

      if (!flashcardResponse.success || !flashcardResponse.data) {
        throw new Error('Flashcard not found');
      }

      const flashcard = flashcardResponse.data as Flashcard;

      if (flashcard.type !== 'flashcard') {
        throw new Error('Item is not a flashcard');
      }

      const currentData = {
        easinessFactor: flashcard.easeFactor,
        repetitionCount: flashcard.repetitions,
        intervalDays: flashcard.interval,
        nextReviewDate: flashcard.nextReviewDate,
        lastReviewDate: flashcard.lastAccessedAt,
        reviewHistory: [],
      };

      const result = spacedRepetitionService.calculateNextReview(currentData, quality);

      const updateResponse = await vaultItemsService.updateFlashcard(flashcardId, {
        nextReviewDate: result.nextReviewDate,
        interval: result.intervalDays,
        easeFactor: result.easinessFactor,
        repetitions: result.repetitionCount,
      });

      return updateResponse;
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to review flashcard',
        success: false,
      };
    }
  },
};
