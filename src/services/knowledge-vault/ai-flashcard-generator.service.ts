import { getFeatureConfig } from '@/lib/llm/config/feature-config-store';
import { getApiKey, hasApiKey } from '@/lib/llm/config/api-key-store';
import { createProvider } from '@/lib/llm/providers/provider-factory';
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

export const aiFlashcardGeneratorService = {
  async generateFromLesson(input: GenerateFlashcardsInput): Promise<ApiResponse<Flashcard[]>> {
    try {
      const featureConfig = await getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = await getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const count = input.count || 5;
      const prompt = `You are an expert educator creating flashcards for spaced repetition learning.

Lesson: ${input.lessonTitle}

Content:
${input.lessonContent.substring(0, 3000)}

Generate ${count} high-quality flashcards that:
1. Focus on key concepts and important details
2. Have clear, specific questions on the front
3. Have complete, educational answers on the back
4. Are appropriate for spaced repetition study
5. Cover different aspects of the lesson

Return ONLY valid JSON in this exact format:
{
  "flashcards": [
    {
      "front": "Question or concept to recall",
      "back": "Complete answer with explanation"
    }
  ]
}`;

      const response = await provider.invoke([{ role: 'user', content: prompt }]);

      const parsed = JSON.parse(response);
      const flashcardsData: FlashcardData[] = parsed.flashcards || [];

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
      const featureConfig = await getFeatureConfig('goalRefinement');
      if (!featureConfig || !hasApiKey(featureConfig.provider)) {
        throw new Error('LLM not configured. Please configure in Settings.');
      }

      const apiKey = await getApiKey(featureConfig.provider);
      if (!apiKey) {
        throw new Error('API key not found');
      }

      const provider = createProvider(featureConfig.provider, apiKey, featureConfig.model);

      const prompt = `You are an expert educator creating flashcards for spaced repetition learning.

Topic: ${title}

Content:
${content.substring(0, 3000)}

Generate ${count} high-quality flashcards that test understanding of this content.

Return ONLY valid JSON in this exact format:
{
  "flashcards": [
    {
      "front": "Question or concept to recall",
      "back": "Complete answer with explanation"
    }
  ]
}`;

      const response = await provider.invoke([{ role: 'user', content: prompt }]);

      const parsed = JSON.parse(response);

      return {
        data: parsed.flashcards || [],
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
