/** Minimum dated projects before rendering the full Gantt chrome (zoom, axis, legend). */
export const PROJECT_TIMELINE_FULL_GANTT_MIN = 4;

export const PROJECT_TIMELINE_SPARSE_TITLE = 'Add target dates to see the timeline';

export const PROJECT_TIMELINE_SPARSE_DESCRIPTION =
  'Set target end dates on your projects to populate the timeline. Optional start dates refine scheduling. Four or more dated projects unlock the full chart.';

export const PROJECT_TIMELINE_AFFORDANCE_HINT =
  'Drag bars to reschedule; drag the right connector to another project to add a finish-to-start dependency. Downstream projects shift automatically.';

export function isProjectTimelineSparse(datedCount: number): boolean {
  return datedCount < PROJECT_TIMELINE_FULL_GANTT_MIN;
}

export function shouldShowProjectTimelineCompactStrip(datedCount: number): boolean {
  return datedCount > 0 && isProjectTimelineSparse(datedCount);
}
