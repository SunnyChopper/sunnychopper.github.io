import { describe, expect, it } from 'vitest';

import {
  buildFlashcardsHubDeckUrl,
  buildStudySessionDeckUrl,
  formatOverdueCountLabel,
  isFlashcardDueForReview,
  shouldShowDeckOverduePill,
} from '@/lib/knowledge-vault/flashcard-deck-overdue';

describe('flashcard-deck-overdue helpers', () => {
  it('formatOverdueCountLabel pluralizes correctly', () => {
    expect(formatOverdueCountLabel(1)).toBe('1 overdue');
    expect(formatOverdueCountLabel(3)).toBe('3 overdue');
  });

  it('shouldShowDeckOverduePill when cardsDue > 0', () => {
    expect(shouldShowDeckOverduePill(0)).toBe(false);
    expect(shouldShowDeckOverduePill(1)).toBe(true);
    expect(shouldShowDeckOverduePill(5)).toBe(true);
  });

  it('isFlashcardDueForReview treats past dates as due', () => {
    expect(isFlashcardDueForReview('2020-01-01')).toBe(true);
  });

  it('isFlashcardDueForReview treats future dates as not due', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(isFlashcardDueForReview(future.toISOString())).toBe(false);
  });

  it('buildStudySessionDeckUrl encodes deckId and startReview', () => {
    const url = buildStudySessionDeckUrl('deck-abc');
    expect(url).toContain('deckId=deck-abc');
    expect(url).toContain('startReview=1');
    expect(url).toContain('/admin/knowledge-vault/study');
  });

  it('buildFlashcardsHubDeckUrl encodes deckId', () => {
    const url = buildFlashcardsHubDeckUrl('deck-xyz');
    expect(url).toContain('deckId=deck-xyz');
    expect(url).toContain('/admin/knowledge-vault/flashcards');
  });
});
