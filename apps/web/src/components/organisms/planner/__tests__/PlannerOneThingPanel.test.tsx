import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlannerOneThingPanel } from '@/components/organisms/planner/PlannerOneThingPanel';
import type { OneThingCandidate, OneThingSelection } from '@/types/planner';

const mutateMock = vi.fn();
const mutateAsyncMock = vi.fn();

let oneThingData: OneThingSelection | undefined;
let oneThingLoading = false;
let suggestPending = false;
let suggestError = false;
let savePending = false;

vi.mock('@/hooks/usePlanner', () => ({
  useOneThing: () => ({
    data: oneThingData,
    isLoading: oneThingLoading,
  }),
  useSuggestOneThing: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: suggestPending,
    isError: suggestError,
  }),
  useSetOneThing: () => ({
    mutate: mutateMock,
    isPending: savePending,
  }),
}));

vi.mock('@/lib/planner/week', () => ({
  todayISOLocal: () => '2026-07-28',
  addDaysISO: (_date: string, days: number) => {
    if (days === 1) return '2026-07-29';
    return _date;
  },
}));

function sampleCandidate(partial: Partial<OneThingCandidate>): OneThingCandidate {
  return {
    taskId: 'task-1',
    title: 'Ship planner polish',
    plannerScore: 180,
    reason: 'Overdue P1 backlog item',
    ...partial,
  };
}

describe('PlannerOneThingPanel', () => {
  beforeEach(() => {
    oneThingData = undefined;
    oneThingLoading = false;
    suggestPending = false;
    suggestError = false;
    savePending = false;
    mutateMock.mockReset();
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({
      candidates: [
        sampleCandidate({ taskId: 'task-1', title: 'Ship planner polish', plannerScore: 180 }),
        sampleCandidate({
          taskId: 'task-2',
          title: 'Review weekly goals',
          plannerScore: 120,
          reason: 'Due soon',
        }),
        sampleCandidate({
          taskId: 'task-3',
          title: 'Should not render',
          plannerScore: 90,
        }),
      ],
      targetDate: '2026-07-29',
    });
  });

  it('shows at most two click-to-pin suggestions and no Save button', async () => {
    render(<PlannerOneThingPanel />);

    expect(await screen.findByText('Ship planner polish')).toBeInTheDocument();
    expect(screen.getByText('Review weekly goals')).toBeInTheDocument();
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save one thing/i })).not.toBeInTheDocument();
  });

  it('pins immediately when a suggestion is clicked', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<PlannerOneThingPanel onSaved={onSaved} />);

    await screen.findByText('Ship planner polish');
    await user.click(screen.getByRole('button', { name: /ship planner polish/i }));

    expect(mutateMock).toHaveBeenCalledWith(
      {
        targetDate: '2026-07-29',
        taskId: 'task-1',
        selectionReason: 'Planner — suggested pin',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('shows calm empty copy when suggestions return no candidates', async () => {
    mutateAsyncMock.mockResolvedValue({ candidates: [], targetDate: '2026-07-29' });
    render(<PlannerOneThingPanel />);

    expect(await screen.findByText(/no high-priority items to suggest yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save one thing/i })).not.toBeInTheDocument();
  });

  it('shows locked confirmation without suggestions when already pinned', () => {
    oneThingData = {
      targetDate: '2026-07-29',
      selectedTaskId: 'task-locked',
      candidateTaskIds: ['task-locked'],
      selectionReason: 'Planner — suggested pin',
      lockedAt: '2026-07-28T12:00:00Z',
      source: 'user',
    };

    render(<PlannerOneThingPanel />);

    expect(screen.getByText(/locked for tomorrow/i)).toBeInTheDocument();
    expect(screen.getByText('task-locked')).toBeInTheDocument();
    expect(screen.queryByText(/suggested focus/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save one thing/i })).not.toBeInTheDocument();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
