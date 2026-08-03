import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CapacityDeScopeAdvisory } from '../CapacityDeScopeAdvisory';
import type { WeeklyReviewCapacityAdvisory } from '@/types/growth-system';

const advisory: WeeklyReviewCapacityAdvisory = {
  softWeeklyCapacityStoryPoints: 10,
  trailingWeeklyAverageStoryPoints: 12,
  recoveryMultiplier: 1,
  marginBuffer: 0,
  nextWeekStart: '2026-04-20',
  nextWeekEnd: '2026-04-26',
  scheduledStoryPoints: 14,
  candidates: [
    {
      taskId: 't1',
      title: 'Overload task',
      size: 8,
      priority: 'P3',
      rolloverCount: 0,
    },
  ],
};

describe('CapacityDeScopeAdvisory', () => {
  it('shows overload strip and move to backlog action', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <CapacityDeScopeAdvisory
        advisory={advisory}
        acceptedSuggestions={[]}
        deScopeDecisions={[]}
        techDebtDecisions={[]}
        onDeScopeChange={onChange}
      />
    );

    expect(screen.getByText(/Planned 14 \/ Soft capacity 10 pts/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Move to backlog/i }));
    expect(onChange).toHaveBeenCalledWith([{ taskId: 't1', action: 'backlog' }]);
  });

  it('hides when under capacity with no queued decisions', () => {
    const under: WeeklyReviewCapacityAdvisory = {
      ...advisory,
      scheduledStoryPoints: 8,
      candidates: [],
    };
    const { container } = render(
      <CapacityDeScopeAdvisory
        advisory={under}
        acceptedSuggestions={[]}
        deScopeDecisions={[]}
        techDebtDecisions={[]}
        onDeScopeChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
