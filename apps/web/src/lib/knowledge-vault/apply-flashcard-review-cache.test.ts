import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { applyFlashcardReviewToCache } from '@/lib/knowledge-vault/apply-flashcard-review-cache';
import { queryKeys } from '@/lib/react-query/query-keys';
import type { Flashcard, FlashcardDeck, VaultItem } from '@/types/knowledge-vault';

function makeFlashcardVaultItem(overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id: 'card-1',
    type: 'flashcard',
    title: 'Test',
    content: null,
    tags: [],
    area: 'Operations',
    status: 'active',
    searchableText: 'test',
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastAccessedAt: null,
    deckId: 'deck-1',
    front: 'Front',
    back: 'Back',
    sourceItemId: null,
    nextReviewDate: '2026-01-01',
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    ...overrides,
  };
}

function makeDeck(cardsDue: number): FlashcardDeck {
  return {
    id: 'deck-1',
    name: 'Deck',
    description: null,
    topic: null,
    area: 'Operations',
    tags: [],
    sourceItemIds: [],
    totalCards: 5,
    cardsDue,
    cardsNew: 0,
    cardsMastered: 0,
    lastStudiedAt: null,
    userId: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('applyFlashcardReviewToCache', () => {
  it('decrements deck cardsDue when a due card is no longer due', () => {
    const queryClient = new QueryClient();
    const pastDue = '2026-01-01';
    const futureDue = '2030-01-01';

    queryClient.setQueryData(queryKeys.knowledgeVault.vaultItems(), [
      makeFlashcardVaultItem({ nextReviewDate: pastDue }),
    ]);
    queryClient.setQueryData(queryKeys.knowledgeVault.flashcardDecks(), [makeDeck(1)]);

    applyFlashcardReviewToCache(queryClient, {
      flashcardId: 'card-1',
      deckId: 'deck-1',
      previousNextReviewDate: pastDue,
      updatedFlashcard: {
        nextReviewDate: futureDue,
        interval: 6,
        easeFactor: 2.5,
        repetitions: 2,
        updatedAt: '2026-07-29T00:00:00.000Z',
      },
    });

    const decks = queryClient.getQueryData<FlashcardDeck[]>(
      queryKeys.knowledgeVault.flashcardDecks()
    );
    expect(decks?.[0]?.cardsDue).toBe(0);

    const items = queryClient.getQueryData<VaultItem[]>(queryKeys.knowledgeVault.vaultItems());
    const card = items?.find((i): i is Flashcard => i.id === 'card-1' && i.type === 'flashcard');
    expect(card?.nextReviewDate).toBe(futureDue);
  });

  it('does not decrement cardsDue when card remains due', () => {
    const queryClient = new QueryClient();
    const pastDue = '2026-01-01';
    const stillDue = '2026-01-02';

    queryClient.setQueryData(queryKeys.knowledgeVault.vaultItems(), [
      makeFlashcardVaultItem({ nextReviewDate: pastDue }),
    ]);
    queryClient.setQueryData(queryKeys.knowledgeVault.flashcardDecks(), [makeDeck(2)]);

    applyFlashcardReviewToCache(queryClient, {
      flashcardId: 'card-1',
      deckId: 'deck-1',
      previousNextReviewDate: pastDue,
      updatedFlashcard: {
        nextReviewDate: stillDue,
        interval: 1,
        easeFactor: 2.3,
        repetitions: 1,
        updatedAt: '2026-07-29T00:00:00.000Z',
      },
    });

    const decks = queryClient.getQueryData<FlashcardDeck[]>(
      queryKeys.knowledgeVault.flashcardDecks()
    );
    expect(decks?.[0]?.cardsDue).toBe(2);
  });

  it('floors cardsDue at zero', () => {
    const queryClient = new QueryClient();
    const pastDue = '2026-01-01';

    queryClient.setQueryData(queryKeys.knowledgeVault.flashcardDecks(), [makeDeck(0)]);

    applyFlashcardReviewToCache(queryClient, {
      flashcardId: 'card-1',
      deckId: 'deck-1',
      previousNextReviewDate: pastDue,
      updatedFlashcard: {
        nextReviewDate: '2030-01-01',
        interval: 6,
        easeFactor: 2.5,
        repetitions: 2,
        updatedAt: '2026-07-29T00:00:00.000Z',
      },
    });

    const decks = queryClient.getQueryData<FlashcardDeck[]>(
      queryKeys.knowledgeVault.flashcardDecks()
    );
    expect(decks?.[0]?.cardsDue).toBe(0);
  });
});
