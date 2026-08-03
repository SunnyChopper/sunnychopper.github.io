import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlannerBlockCard } from '../PlannerBlockCard';
import type { PlannerBlock } from '@/types/planner';

function makeBlock(overrides: Partial<PlannerBlock> = {}): PlannerBlock {
  return {
    id: 'block-1',
    date: '2026-07-28',
    startAt: '2026-07-28T09:00:00',
    endAt: '2026-07-28T10:00:00',
    durationMinutes: 60,
    taskId: 'task-1',
    taskTitleSnapshot: 'Ship feature',
    source: 'manual',
    status: 'scheduled',
    storyPointsLoad: 2,
    calendarEventId: null,
    microStepId: null,
    microStepText: null,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('PlannerBlockCard', () => {
  it('exposes full title on hover and assistive name when title is long', () => {
    const longTitle =
      'Platform migration phase two infrastructure rollout with extended stakeholder alignment';
    render(<PlannerBlockCard block={makeBlock({ taskTitleSnapshot: longTitle })} />);

    const titleNode = screen.getByText(longTitle);
    expect(titleNode).toHaveClass('line-clamp-2');
    expect(titleNode).toHaveAttribute('title', longTitle);
    expect(titleNode).toHaveAccessibleName(longTitle);
  });

  it('falls back to micro step text for title tooltip', () => {
    const microStep = 'Draft the rollout checklist for infrastructure migration';
    render(
      <PlannerBlockCard block={makeBlock({ taskTitleSnapshot: null, microStepText: microStep })} />
    );

    const titleNode = screen.getByText(microStep);
    expect(titleNode).toHaveAttribute('title', microStep);
    expect(titleNode).toHaveAccessibleName(microStep);
  });

  it('renders PriorityIndicator when priority is provided', () => {
    render(<PlannerBlockCard block={makeBlock()} priority="P1" />);
    const badge = screen.getByText('P1');
    expect(badge).toHaveAttribute('aria-label', 'Priority P1: Critical/Urgent');
  });

  it('omits priority badge when priority is not provided', () => {
    render(<PlannerBlockCard block={makeBlock()} />);
    expect(screen.queryByText('P1')).not.toBeInTheDocument();
    expect(screen.queryByText('P3')).not.toBeInTheDocument();
  });
});
