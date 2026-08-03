import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccumulatedTechDebt } from '@/components/organisms/AccumulatedTechDebt';
import type {
  WeeklyReviewTechDebtCandidate,
  WeeklyReviewTechDebtDecision,
} from '@/types/growth-system';

const candidates: WeeklyReviewTechDebtCandidate[] = [
  {
    taskId: 't1',
    title: 'Stale API migration',
    status: 'In Progress',
    scheduledDate: '2026-04-14T00:00:00Z',
    rolloverCount: 3,
    dueDate: null,
    rolledFromWeekStart: '2026-03-03',
  },
  {
    taskId: 't2',
    title: 'Docs cleanup',
    status: 'Not Started',
    scheduledDate: '2026-04-15T00:00:00Z',
    rolloverCount: 1,
    dueDate: '2026-04-16T00:00:00Z',
    rolledFromWeekStart: '2026-03-10',
  },
];

describe('AccumulatedTechDebt', () => {
  it('renders empty state when no candidates', () => {
    render(<AccumulatedTechDebt candidates={[]} decisions={[]} onChange={vi.fn()} />);
    expect(screen.getByText(/No accumulated debt/i)).toBeInTheDocument();
  });

  it('renders rollover badges and task titles', () => {
    render(<AccumulatedTechDebt candidates={candidates} decisions={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Stale API migration')).toBeInTheDocument();
    expect(screen.getByText('Rolled 3x')).toBeInTheDocument();
    expect(screen.getByText('Rolled 1x')).toBeInTheDocument();
  });

  it('shows Rolled 0x with muted badge and origin-week tooltip', () => {
    const zeroRoll: WeeklyReviewTechDebtCandidate = {
      taskId: 't0',
      title: 'Fresh task',
      status: 'Not Started',
      scheduledDate: '2026-04-15T00:00:00Z',
      rolloverCount: 0,
      dueDate: null,
      rolledFromWeekStart: '2026-04-13',
    };
    render(<AccumulatedTechDebt candidates={[zeroRoll]} decisions={[]} onChange={vi.fn()} />);
    const badge = screen.getByText('Rolled 0x');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-200');
    expect(badge).toHaveAttribute('title', 'Rolled from week of 2026-04-13');
    expect(badge).toHaveAttribute('aria-label', 'Rolled from week of 2026-04-13');
  });

  it('uses warning styling and tooltip for rolled tasks', () => {
    render(<AccumulatedTechDebt candidates={candidates} decisions={[]} onChange={vi.fn()} />);
    const badge = screen.getByText('Rolled 1x');
    expect(badge).toHaveClass('bg-amber-600/90');
    expect(badge).toHaveAttribute('title', 'Rolled from week of 2026-03-10');
  });

  it('falls back to scheduledDate monday and weekStart when rolledFromWeekStart is missing', () => {
    const legacy: WeeklyReviewTechDebtCandidate = {
      taskId: 't-legacy',
      title: 'Legacy snapshot task',
      status: 'In Progress',
      scheduledDate: '2026-04-16T00:00:00Z',
      rolloverCount: 2,
      dueDate: null,
    };
    render(
      <AccumulatedTechDebt
        candidates={[legacy]}
        decisions={[]}
        onChange={vi.fn()}
        weekStart="2026-04-13"
      />
    );
    const badge = screen.getByText('Rolled 2x');
    expect(badge).toHaveAttribute('title', 'Rolled from week of 2026-04-13');
  });

  it('toggles purge and refactor decisions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AccumulatedTechDebt candidates={candidates} decisions={[]} onChange={onChange} />);

    await user.click(screen.getAllByRole('button', { name: /Purge task/i })[0]);
    expect(onChange).toHaveBeenLastCalledWith([{ taskId: 't1', action: 'purge' }]);

    const decisions: WeeklyReviewTechDebtDecision[] = [{ taskId: 't1', action: 'purge' }];
    onChange.mockClear();
    render(
      <AccumulatedTechDebt candidates={candidates} decisions={decisions} onChange={onChange} />
    );
    await user.click(screen.getAllByRole('button', { name: /Refactor to next week/i })[0]);
    expect(onChange).toHaveBeenLastCalledWith([{ taskId: 't1', action: 'refactor' }]);
  });

  it('does not change decisions when readOnly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AccumulatedTechDebt candidates={candidates} decisions={[]} onChange={onChange} readOnly />
    );
    await user.click(screen.getAllByRole('button', { name: /Purge task/i })[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
