import { describe, expect, it } from 'vitest';
import {
  PROJECT_STATUS_BADGE_COLORS,
  PROJECT_STATUS_TIMELINE_LEGEND_CORE,
  PROJECT_STATUS_TIMELINE_TOKENS,
  getProjectStatusBadgeColors,
  getProjectStatusTimelineBarClasses,
} from './project-status-surfaces';

describe('project-status-surfaces', () => {
  it('maps each core status to the expected hue family for badges', () => {
    expect(PROJECT_STATUS_BADGE_COLORS.Planning.text).toContain('purple');
    expect(PROJECT_STATUS_BADGE_COLORS.Active.text).toContain('blue');
    expect(PROJECT_STATUS_BADGE_COLORS.Stale.text).toContain('rose');
    expect(PROJECT_STATUS_BADGE_COLORS.Completed.text).toContain('green');
  });

  it('maps each core status to the expected hue family for timeline bars', () => {
    expect(getProjectStatusTimelineBarClasses('Planning')).toContain('purple');
    expect(getProjectStatusTimelineBarClasses('Active')).toContain('blue');
    expect(getProjectStatusTimelineBarClasses('Stale')).toContain('rose');
    expect(getProjectStatusTimelineBarClasses('Completed')).toContain('green');
    expect(getProjectStatusTimelineBarClasses('Stale')).toContain('border-dashed');
  });

  it('aligns legend swatches with timeline token swatch classes', () => {
    for (const entry of PROJECT_STATUS_TIMELINE_LEGEND_CORE) {
      const key = entry.label as 'Planning' | 'Active' | 'Stale' | 'Completed';
      expect(entry.swatchClass).toBe(PROJECT_STATUS_TIMELINE_TOKENS[key].legendSwatchClass);
    }
  });

  it('getProjectStatusBadgeColors returns undefined for non-core statuses', () => {
    expect(getProjectStatusBadgeColors('On Hold')).toBeUndefined();
    expect(getProjectStatusBadgeColors('Active')).toEqual(PROJECT_STATUS_BADGE_COLORS.Active);
  });
});
