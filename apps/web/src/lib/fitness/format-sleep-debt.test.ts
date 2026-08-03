import { describe, expect, it } from 'vitest';
import { sleepDebtStatusLine } from '@/lib/fitness/format-sleep-debt';

describe('format-sleep-debt', () => {
  it('formats empty window copy', () => {
    expect(sleepDebtStatusLine(0, 0)).toBe('Sleep debt · no sleep logged (7d)');
  });

  it('formats shortfall copy with one decimal', () => {
    expect(sleepDebtStatusLine(3, 4.25)).toBe('Sleep debt · 4.3h short (7d)');
  });
});
