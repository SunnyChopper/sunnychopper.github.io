import { describe, expect, it } from 'vitest';
import {
  NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE,
  countHighConfidenceNovelTags,
  filterNovelSuggestedTags,
  isHighConfidenceTag,
  mergeTags,
  normalizeSuggestedTagLabel,
  relevanceToPercent,
  selectHighConfidenceTags,
} from '../note-suggest-tags';

const row = (tag: string, relevance: number) => ({
  tag,
  relevance,
  reasoning: 'test',
});

describe('note-suggest-tags', () => {
  it('normalizes tag labels to lowercase trimmed', () => {
    expect(normalizeSuggestedTagLabel('  Agentic  ')).toBe('agentic');
  });

  it('converts relevance to percent clamped 0-100', () => {
    expect(relevanceToPercent(0.695)).toBe(70);
    expect(relevanceToPercent(1.5)).toBe(100);
    expect(relevanceToPercent(-0.1)).toBe(0);
  });

  it('filters novel tags and dedupes suggestions', () => {
    const suggested = [row('AI', 0.9), row('ai', 0.8), row('existing', 0.85), row('low', 0.4)];
    const novel = filterNovelSuggestedTags(suggested, ['existing']);
    expect(novel.map((t) => t.tag)).toEqual(['ai', 'low']);
  });

  it('uses 0.7 threshold for high confidence boundary', () => {
    expect(isHighConfidenceTag(row('a', 0.69))).toBe(false);
    expect(isHighConfidenceTag(row('b', 0.7))).toBe(true);
    expect(isHighConfidenceTag(row('c', 0.71))).toBe(true);
    expect(NOTE_SUGGEST_TAGS_HIGH_CONFIDENCE).toBe(0.7);
  });

  it('selectHighConfidenceTags returns only qualifying items', () => {
    const items = [row('high', 0.9), row('edge', 0.7), row('low', 0.5)];
    expect(selectHighConfidenceTags(items).map((t) => t.tag)).toEqual(['high', 'edge']);
  });

  it('mergeTags dedupes against existing', () => {
    expect(mergeTags(['foo', 'bar'], ['Bar', 'baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('countHighConfidenceNovelTags excludes already applied', () => {
    const suggestions = [row('high', 0.9), row('edge', 0.7), row('low', 0.5)];
    expect(countHighConfidenceNovelTags(suggestions, ['high'])).toBe(1);
    expect(countHighConfidenceNovelTags(suggestions, [])).toBe(2);
  });

  it('returns empty novel list when all duplicates', () => {
    const suggested = [row('dup', 0.9)];
    expect(filterNovelSuggestedTags(suggested, ['dup'])).toEqual([]);
  });
});
