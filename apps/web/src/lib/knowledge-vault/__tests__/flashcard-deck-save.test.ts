import { describe, expect, it } from 'vitest';
import {
  canSaveFlashcardDeck,
  canSaveFlashcardDeckWithSoftLimits,
  findFirstFlashcardSideOverLimit,
  getFlashcardSideCharTone,
  isFlashcardSideOverHardLimit,
} from '@/lib/knowledge-vault/flashcard-deck-save';

function repeat(char: string, count: number): string {
  return char.repeat(count);
}

describe('canSaveFlashcardDeck', () => {
  it('returns false when no card has both front and back', () => {
    expect(canSaveFlashcardDeck([{ front: '', back: '' }])).toBe(false);
    expect(
      canSaveFlashcardDeck([
        { front: 'Q', back: '' },
        { front: '', back: 'A' },
      ])
    ).toBe(false);
  });

  it('returns true when at least one card has both front and back', () => {
    expect(canSaveFlashcardDeck([{ front: 'Q', back: 'A' }])).toBe(true);
    expect(
      canSaveFlashcardDeck([
        { front: '', back: '' },
        { front: ' Q ', back: ' A ' },
      ])
    ).toBe(true);
  });
});

describe('getFlashcardSideCharTone', () => {
  it('returns default below 180', () => {
    expect(getFlashcardSideCharTone(0)).toBe('default');
    expect(getFlashcardSideCharTone(179)).toBe('default');
  });

  it('returns amber from 180 through 249', () => {
    expect(getFlashcardSideCharTone(180)).toBe('amber');
    expect(getFlashcardSideCharTone(249)).toBe('amber');
  });

  it('returns red from 250 upward', () => {
    expect(getFlashcardSideCharTone(250)).toBe('red');
    expect(getFlashcardSideCharTone(301)).toBe('red');
  });
});

describe('isFlashcardSideOverHardLimit', () => {
  it('is false at or below 300 and true above', () => {
    expect(isFlashcardSideOverHardLimit(repeat('a', 300))).toBe(false);
    expect(isFlashcardSideOverHardLimit(repeat('a', 301))).toBe(true);
  });
});

describe('findFirstFlashcardSideOverLimit', () => {
  it('returns null when no side exceeds 300', () => {
    expect(
      findFirstFlashcardSideOverLimit([{ front: repeat('a', 300), back: repeat('b', 300) }])
    ).toBeNull();
  });

  it('returns first violating card front before back', () => {
    expect(
      findFirstFlashcardSideOverLimit([
        { front: repeat('a', 301), back: 'ok' },
        { front: repeat('b', 301), back: 'ok' },
      ])
    ).toEqual({ cardIndex: 1, side: 'front' });

    expect(findFirstFlashcardSideOverLimit([{ front: 'ok', back: repeat('a', 301) }])).toEqual({
      cardIndex: 1,
      side: 'back',
    });
  });

  it('prefers earlier card when multiple violate', () => {
    expect(
      findFirstFlashcardSideOverLimit([
        { front: 'ok', back: 'ok' },
        { front: repeat('a', 301), back: 'ok' },
      ])
    ).toEqual({ cardIndex: 2, side: 'front' });
  });
});

describe('canSaveFlashcardDeckWithSoftLimits', () => {
  it('blocks save when content is valid but a side exceeds 300', () => {
    expect(canSaveFlashcardDeckWithSoftLimits([{ front: repeat('a', 301), back: 'answer' }])).toBe(
      false
    );
  });

  it('allows save at exactly 300 with valid content', () => {
    expect(
      canSaveFlashcardDeckWithSoftLimits([{ front: repeat('a', 300), back: repeat('b', 300) }])
    ).toBe(true);
  });
});
