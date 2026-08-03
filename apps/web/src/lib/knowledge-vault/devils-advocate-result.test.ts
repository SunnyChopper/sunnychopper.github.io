import { describe, expect, it } from 'vitest';

import {
  formatCritiqueBullet,
  formatSectionItemCount,
  getDevilsAdvocateNonEmptySections,
  normalizeDevilsAdvocatePayload,
} from '@/lib/knowledge-vault/devils-advocate-result';

describe('normalizeDevilsAdvocatePayload', () => {
  it('normalizes a happy-path payload with snake_case keys', () => {
    const result = normalizeDevilsAdvocatePayload({
      fallacies: ['Straw man: ignores nuance'],
      unsupported_claims: ['No benchmarks cited'],
      counter_arguments: [],
      missing_evidence: ['No discussion of verification: tests missing'],
      contradictions: ['Claims X and not-X'],
    });

    expect(result.fallacies).toEqual(['Straw man: ignores nuance']);
    expect(result.unsupported_claims).toEqual(['No benchmarks cited']);
    expect(result.counter_arguments).toEqual([]);
    expect(result.missing_evidence).toEqual(['No discussion of verification: tests missing']);
    expect(result.contradictions).toEqual(['Claims X and not-X']);
  });

  it('returns empty lists for missing keys', () => {
    const result = normalizeDevilsAdvocatePayload({});
    expect(result).toEqual({
      fallacies: [],
      contradictions: [],
      unsupported_claims: [],
      missing_evidence: [],
      counter_arguments: [],
    });
  });

  it('ignores non-array values and trims/filters empty strings', () => {
    const result = normalizeDevilsAdvocatePayload({
      fallacies: 'not-an-array',
      missing_evidence: ['  valid item  ', '', '   ', 42, null],
    });

    expect(result.fallacies).toEqual([]);
    expect(result.missing_evidence).toEqual(['valid item']);
  });

  it('returns empty payload for nullish or non-object input', () => {
    expect(normalizeDevilsAdvocatePayload(null).fallacies).toEqual([]);
    expect(normalizeDevilsAdvocatePayload(undefined).fallacies).toEqual([]);
    expect(normalizeDevilsAdvocatePayload('bad').fallacies).toEqual([]);
  });
});

describe('getDevilsAdvocateNonEmptySections', () => {
  it('omits empty sections and preserves canonical order', () => {
    const payload = normalizeDevilsAdvocatePayload({
      fallacies: ['a'],
      contradictions: [],
      unsupported_claims: ['b'],
      missing_evidence: ['c', 'd'],
      counter_arguments: [],
    });

    const sections = getDevilsAdvocateNonEmptySections(payload);
    expect(sections.map((s) => s.key)).toEqual([
      'fallacies',
      'unsupported_claims',
      'missing_evidence',
    ]);
    expect(sections[0]?.severity).toBe('critical');
    expect(sections[1]?.severity).toBe('warning');
  });

  it('returns no sections for an all-empty payload', () => {
    expect(getDevilsAdvocateNonEmptySections(normalizeDevilsAdvocatePayload({}))).toEqual([]);
  });
});

describe('formatCritiqueBullet', () => {
  it('splits on the first ": " into lead and body', () => {
    expect(
      formatCritiqueBullet(
        'No quantitative benchmarks: token-cost reduction from caching and accuracy gains'
      )
    ).toEqual({
      lead: 'No quantitative benchmarks:',
      body: 'token-cost reduction from caching and accuracy gains',
    });
  });

  it('returns body-only when no category delimiter is present', () => {
    expect(formatCritiqueBullet('Plain critique without delimiter')).toEqual({
      body: 'Plain critique without delimiter',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(formatCritiqueBullet('  Category: detail  ')).toEqual({
      lead: 'Category:',
      body: 'detail',
    });
  });
});

describe('formatSectionItemCount', () => {
  it('uses singular for one item', () => {
    expect(formatSectionItemCount(1)).toBe('1 item');
  });

  it('uses plural for zero or multiple items', () => {
    expect(formatSectionItemCount(0)).toBe('0 items');
    expect(formatSectionItemCount(3)).toBe('3 items');
  });
});
