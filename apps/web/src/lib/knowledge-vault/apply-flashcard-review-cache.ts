import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { isFlashcardDueForReview } from '@/lib/knowledge-vault/flashcard-deck-overdue';
import type { Flashcard, FlashcardDeck, VaultItem } from '@/types/knowledge-vault';

export interface ApplyFlashcardReviewCacheInput {
  flashcardId: string;
  deckId?: string;
  previousNextReviewDate: string;
  updatedFlashcard: Pick<
    Flashcard,
    'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions' | 'updatedAt'
  >;
}

/** Optimistically sync vault flashcard + deck cardsDue after a successful review. */
export function applyFlashcardReviewToCache(
  queryClient: QueryClient,
  input: ApplyFlashcardReviewCacheInput
): void {
  const wasDue = isFlashcardDueForReview(input.previousNextReviewDate);
  const stillDue = isFlashcardDueForReview(input.updatedFlashcard.nextReviewDate);

  queryClient.setQueryData<VaultItem[]>(queryKeys.knowledgeVault.vaultItems(), (old) => {
    if (!old) return old;
    return old.map((item) => {
      if (item.id !== input.flashcardId || item.type !== 'flashcard') return item;
      return {
        ...item,
        nextReviewDate: input.updatedFlashcard.nextReviewDate,
        interval: input.updatedFlashcard.interval,
        easeFactor: input.updatedFlashcard.easeFactor,
        repetitions: input.updatedFlashcard.repetitions,
        updatedAt: input.updatedFlashcard.updatedAt,
      };
    });
  });

  if (!input.deckId || !wasDue || stillDue) return;

  queryClient.setQueryData<FlashcardDeck[]>(queryKeys.knowledgeVault.flashcardDecks(), (old) => {
    if (!old) return old;
    return old.map((deck) => {
      if (deck.id !== input.deckId) return deck;
      return { ...deck, cardsDue: Math.max(0, deck.cardsDue - 1) };
    });
  });
}
