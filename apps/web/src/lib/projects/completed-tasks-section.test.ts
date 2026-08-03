import { describe, expect, it } from 'vitest';
import {
  COMPLETED_SECTION_AUTO_COLLAPSE_AFTER,
  formatMostRecentCompletedSummary,
  shouldAutoCollapseCompletedSection,
} from '@/lib/projects/completed-tasks-section';

describe('shouldAutoCollapseCompletedSection', () => {
  it('does not auto-collapse when count is zero', () => {
    expect(shouldAutoCollapseCompletedSection(0)).toBe(false);
  });

  it('does not auto-collapse at the threshold', () => {
    expect(shouldAutoCollapseCompletedSection(COMPLETED_SECTION_AUTO_COLLAPSE_AFTER)).toBe(false);
  });

  it('auto-collapses when count exceeds threshold', () => {
    expect(shouldAutoCollapseCompletedSection(COMPLETED_SECTION_AUTO_COLLAPSE_AFTER + 1)).toBe(
      true
    );
    expect(shouldAutoCollapseCompletedSection(6)).toBe(true);
  });
});

describe('formatMostRecentCompletedSummary', () => {
  it('formats title with points and completed date', () => {
    const summary = formatMostRecentCompletedSummary({
      title: 'Happiness',
      size: 220,
      completedDate: '2026-07-12',
    });
    expect(summary).toContain('Happiness');
    expect(summary).toContain('220pts');
    expect(summary).toContain('Jul');
  });

  it('omits points when size is missing or zero', () => {
    expect(
      formatMostRecentCompletedSummary({
        title: 'Ship release',
        size: null,
        completedDate: '2026-07-12',
      })
    ).toBe('Ship release · Jul 12, 2026');

    expect(
      formatMostRecentCompletedSummary({
        title: 'Ship release',
        size: 0,
        completedDate: '2026-07-12',
      })
    ).toBe('Ship release · Jul 12, 2026');
  });

  it('omits date when completedDate is missing', () => {
    expect(
      formatMostRecentCompletedSummary({
        title: 'Ship release',
        size: 5,
        completedDate: null,
      })
    ).toBe('Ship release · 5pts');
  });

  it('returns title only when no points or date', () => {
    expect(
      formatMostRecentCompletedSummary({
        title: 'Ship release',
        size: null,
        completedDate: null,
      })
    ).toBe('Ship release');
  });
});
