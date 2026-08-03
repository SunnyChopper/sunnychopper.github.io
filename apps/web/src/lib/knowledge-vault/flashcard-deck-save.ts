export const FLASHCARD_SIDE_SOFT_AMBER = 180;
export const FLASHCARD_SIDE_SOFT_RED = 250;
export const FLASHCARD_SIDE_HARD_MAX = 300;

export type FlashcardSideCharTone = 'default' | 'amber' | 'red';

export type FlashcardSideOverLimit = {
  cardIndex: number;
  side: 'front' | 'back';
};

/** True when at least one card has non-empty trimmed front and back. */
export function canSaveFlashcardDeck(cards: { front: string; back: string }[]): boolean {
  return cards.some((c) => c.front.trim() !== '' && c.back.trim() !== '');
}

export function getFlashcardSideCharTone(length: number): FlashcardSideCharTone {
  if (length >= FLASHCARD_SIDE_SOFT_RED) {
    return 'red';
  }
  if (length >= FLASHCARD_SIDE_SOFT_AMBER) {
    return 'amber';
  }
  return 'default';
}

export function isFlashcardSideOverHardLimit(text: string): boolean {
  return text.length > FLASHCARD_SIDE_HARD_MAX;
}

/** Returns the first violating card (1-based index) scanning front before back per card. */
export function findFirstFlashcardSideOverLimit(
  cards: { front: string; back: string }[]
): FlashcardSideOverLimit | null {
  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i];
    if (isFlashcardSideOverHardLimit(card.front)) {
      return { cardIndex: i + 1, side: 'front' };
    }
    if (isFlashcardSideOverHardLimit(card.back)) {
      return { cardIndex: i + 1, side: 'back' };
    }
  }
  return null;
}

export function canSaveFlashcardDeckWithSoftLimits(
  cards: { front: string; back: string }[]
): boolean {
  return canSaveFlashcardDeck(cards) && findFirstFlashcardSideOverLimit(cards) === null;
}
