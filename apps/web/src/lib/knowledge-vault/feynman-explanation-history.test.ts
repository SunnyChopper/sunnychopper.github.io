import { describe, expect, it } from 'vitest';

import {
  pushExplanationHistory,
  truncateExplanationChipLabel,
} from '@/lib/knowledge-vault/feynman-explanation-history';

describe('pushExplanationHistory', () => {
  it('prepends first explanation to empty history', () => {
    expect(pushExplanationHistory([], 'First explanation')).toEqual(['First explanation']);
  });

  it('keeps newest-first order', () => {
    const history = pushExplanationHistory([], 'A');
    const next = pushExplanationHistory(history, 'B');
    expect(next).toEqual(['B', 'A']);
  });

  it('caps history at three entries', () => {
    let history: string[] = [];
    history = pushExplanationHistory(history, 'One');
    history = pushExplanationHistory(history, 'Two');
    history = pushExplanationHistory(history, 'Three');
    history = pushExplanationHistory(history, 'Four');
    expect(history).toEqual(['Four', 'Three', 'Two']);
  });

  it('moves re-submitted older text to front without dropping siblings', () => {
    const history = ['Third', 'Second', 'First'];
    expect(pushExplanationHistory(history, 'First')).toEqual(['First', 'Third', 'Second']);
  });

  it('ignores empty or whitespace-only text', () => {
    expect(pushExplanationHistory(['A'], '   ')).toEqual(['A']);
  });
});

describe('truncateExplanationChipLabel', () => {
  it('returns short text unchanged', () => {
    expect(truncateExplanationChipLabel('Short')).toBe('Short');
  });

  it('truncates long text with ellipsis', () => {
    const long = 'This is a very long explanation that should be truncated for the chip label';
    const result = truncateExplanationChipLabel(long, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith('…')).toBe(true);
  });

  it('collapses internal whitespace', () => {
    expect(truncateExplanationChipLabel('  hello   world  ')).toBe('hello world');
  });
});
