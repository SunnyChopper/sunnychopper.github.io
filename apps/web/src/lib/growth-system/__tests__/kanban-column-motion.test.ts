import { describe, expect, it } from 'vitest';

import { KANBAN_COLUMN_BUSY_COUNT } from '@/lib/growth-system/kanban-constants';
import {
  KANBAN_COLUMN_ENTER_DURATION_SECONDS,
  KANBAN_COLUMN_ENTER_STAGGER_SECONDS,
  getKanbanColumnEnterTransition,
  getKanbanColumnMetricsCountClassName,
  kanbanColumnDragOverClassName,
  kanbanColumnEnterVariants,
} from '@/lib/growth-system/kanban-column-motion';

describe('kanban-column-motion', () => {
  it('staggers column enter within the 40ms polish band', () => {
    expect(KANBAN_COLUMN_ENTER_STAGGER_SECONDS).toBe(0.04);
    expect(KANBAN_COLUMN_ENTER_DURATION_SECONDS).toBeCloseTo(0.2);
  });

  it('delays enter transition by column index', () => {
    expect(getKanbanColumnEnterTransition(0).delay).toBe(0);
    expect(getKanbanColumnEnterTransition(3).delay).toBeCloseTo(0.12);
  });

  it('defines hidden/show enter variants', () => {
    expect(kanbanColumnEnterVariants.hidden).toMatchObject({ opacity: 0, y: 6 });
    expect(kanbanColumnEnterVariants.show).toMatchObject({ opacity: 1, y: 0 });
  });

  it('uses subdued drag-over classes without glow tokens', () => {
    expect(kanbanColumnDragOverClassName).toContain('border-dashed');
    expect(kanbanColumnDragOverClassName).not.toContain('shadow');
  });

  it('styles empty and busy column counts', () => {
    expect(getKanbanColumnMetricsCountClassName(0)).toContain('text-gray-400');
    expect(getKanbanColumnMetricsCountClassName(KANBAN_COLUMN_BUSY_COUNT)).toContain(
      'font-semibold'
    );
    expect(getKanbanColumnMetricsCountClassName(3)).toContain('text-gray-600');
  });
});
