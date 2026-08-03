import { describe, expect, it } from 'vitest';
import {
  isProjectTimelineSparse,
  PROJECT_TIMELINE_AFFORDANCE_HINT,
  PROJECT_TIMELINE_FULL_GANTT_MIN,
  PROJECT_TIMELINE_SPARSE_DESCRIPTION,
  PROJECT_TIMELINE_SPARSE_TITLE,
  shouldShowProjectTimelineCompactStrip,
} from '@/lib/growth-system/project-timeline-sparse';

describe('project-timeline-sparse', () => {
  it('uses threshold 4 for full Gantt', () => {
    expect(PROJECT_TIMELINE_FULL_GANTT_MIN).toBe(4);
  });

  it('treats fewer than 4 dated projects as sparse', () => {
    expect(isProjectTimelineSparse(0)).toBe(true);
    expect(isProjectTimelineSparse(1)).toBe(true);
    expect(isProjectTimelineSparse(3)).toBe(true);
    expect(isProjectTimelineSparse(4)).toBe(false);
    expect(isProjectTimelineSparse(8)).toBe(false);
  });

  it('shows compact strip only for 1–3 dated projects', () => {
    expect(shouldShowProjectTimelineCompactStrip(0)).toBe(false);
    expect(shouldShowProjectTimelineCompactStrip(1)).toBe(true);
    expect(shouldShowProjectTimelineCompactStrip(3)).toBe(true);
    expect(shouldShowProjectTimelineCompactStrip(4)).toBe(false);
  });

  it('exports stable copy constants', () => {
    expect(PROJECT_TIMELINE_SPARSE_TITLE).toBe('Add target dates to see the timeline');
    expect(PROJECT_TIMELINE_SPARSE_DESCRIPTION.length).toBeGreaterThan(0);
    expect(PROJECT_TIMELINE_AFFORDANCE_HINT).toContain('Drag bars to reschedule');
  });
});
