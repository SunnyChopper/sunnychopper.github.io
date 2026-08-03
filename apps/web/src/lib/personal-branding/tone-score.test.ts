import { describe, expect, it } from 'vitest';
import { formatToneScorePercent, humanizeToneMetricKey } from './tone-score';

describe('formatToneScorePercent', () => {
  it('formats 0-1 scores as percentages', () => {
    expect(formatToneScorePercent(0.724)).toBe('72%');
    expect(formatToneScorePercent(1)).toBe('100%');
  });

  it('returns dash for missing values', () => {
    expect(formatToneScorePercent(null)).toBe('—');
    expect(formatToneScorePercent(undefined)).toBe('—');
  });
});

describe('humanizeToneMetricKey', () => {
  it('capitalizes metric keys', () => {
    expect(humanizeToneMetricKey('clarity')).toBe('Clarity');
    expect(humanizeToneMetricKey('authority')).toBe('Authority');
  });
});
