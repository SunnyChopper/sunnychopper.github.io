import { describe, expect, it } from 'vitest';
import {
  formatGoalTimelineBarAriaLabel,
  formatGoalTimelineBarTooltip,
  formatProjectTimelineBarAriaLabel,
  formatProjectTimelineBarTooltip,
  formatTimelineBarStatusLabel,
} from './timeline-bar-tooltip';

describe('formatTimelineBarStatusLabel', () => {
  it('maps project and goal status enums to display labels', () => {
    expect(formatTimelineBarStatusLabel('Active')).toBe('Active');
    expect(formatTimelineBarStatusLabel('Achieved')).toBe('Achieved');
    expect(formatTimelineBarStatusLabel('Stale')).toBe('Stale');
  });
});

describe('formatProjectTimelineBarTooltip', () => {
  it('joins name and badge status', () => {
    expect(
      formatProjectTimelineBarTooltip('AWS Certified Developer – Associate (DVA-C02)', 'Active')
    ).toBe('AWS Certified Developer – Associate (DVA-C02) · Active');
  });

  it('includes progress when showProgress is true', () => {
    expect(
      formatProjectTimelineBarTooltip('Portfolio Site', 'Stale', {
        progressPercent: 80,
        showProgress: true,
      })
    ).toBe('Portfolio Site · Stale · 80%');
  });

  it('omits progress when showProgress is false', () => {
    expect(
      formatProjectTimelineBarTooltip('Portfolio Site', 'Active', {
        progressPercent: 80,
        showProgress: false,
      })
    ).toBe('Portfolio Site · Active');
  });

  it('rounds progress percent', () => {
    expect(
      formatProjectTimelineBarTooltip('Portfolio Site', 'Active', {
        progressPercent: 79.6,
        showProgress: true,
      })
    ).toBe('Portfolio Site · Active · 80%');
  });
});

describe('formatGoalTimelineBarTooltip', () => {
  it('joins title and status label', () => {
    expect(formatGoalTimelineBarTooltip('Launch mobile app', 'Active')).toBe(
      'Launch mobile app · Active'
    );
  });
});

describe('formatProjectTimelineBarAriaLabel', () => {
  it('includes summary and date range', () => {
    expect(
      formatProjectTimelineBarAriaLabel(
        'Long project name',
        'Active',
        'Jan 1, 2026',
        'Mar 1, 2026',
        {
          progressPercent: 42,
          showProgress: true,
        }
      )
    ).toBe('Project: Long project name · Active · 42%, Jan 1, 2026 to Mar 1, 2026');
  });
});

describe('formatGoalTimelineBarAriaLabel', () => {
  it('includes summary and date range', () => {
    expect(
      formatGoalTimelineBarAriaLabel('Launch mobile app', 'Achieved', 'Jan 1, 2026', 'Jun 1, 2026')
    ).toBe('Goal: Launch mobile app · Achieved, Jan 1, 2026 to Jun 1, 2026');
  });
});
