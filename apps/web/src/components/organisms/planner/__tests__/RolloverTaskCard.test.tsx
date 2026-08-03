import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RolloverTaskCard } from '../RolloverTaskCard';
import type { PlannerRolloverTask } from '@/types/planner';
import {
  plannerRolloverBadgeClassName,
  plannerRolloverCardClassName,
  plannerRolloverOverdueBadgeClassName,
} from '@/lib/planner/planner-surfaces';

const sample: PlannerRolloverTask = {
  rolloverId: '2026-05-21#task-1',
  taskId: 'task-1',
  title: 'Missed deploy',
  priority: 'P1',
  storyPoints: 5,
  sourceDate: '2026-05-20',
  reason: 'missedScheduledDate',
  badge: 'Rolled Over',
};

describe('RolloverTaskCard', () => {
  it('renders priority badge left of title', () => {
    const onAction = vi.fn();
    render(<RolloverTaskCard task={sample} onAction={onAction} />);
    const badge = screen.getByText('P1');
    expect(badge).toHaveAttribute('aria-label', 'Priority P1: Critical/Urgent');
    expect(screen.getByText('Missed deploy')).toBeInTheDocument();
  });

  it('renders badge and actions', () => {
    const onAction = vi.fn();
    render(<RolloverTaskCard task={sample} onAction={onAction} />);
    expect(screen.getByText('Rolled Over')).toBeInTheDocument();
    expect(screen.getByText('Missed deploy')).toBeInTheDocument();
    expect(screen.getByText('5 SP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Keep task for today/i }));
    expect(onAction).toHaveBeenCalledWith('2026-05-21#task-1', 'keep');
  });

  it('exposes full title on hover and assistive name when title is long', () => {
    const longTitle =
      'Platform migration phase two infrastructure rollout with extended stakeholder alignment';
    render(<RolloverTaskCard task={{ ...sample, title: longTitle }} onAction={vi.fn()} />);

    const titleNode = screen.getByText(longTitle);
    expect(titleNode).toHaveClass('line-clamp-2');
    expect(titleNode).toHaveAttribute('title', longTitle);
    expect(titleNode).toHaveAccessibleName(longTitle);
  });

  it('always renders Keep and Backlog without hover', () => {
    render(<RolloverTaskCard task={sample} onAction={vi.fn()} />);
    const actions = screen.getByTestId('rollover-actions');
    expect(actions).toBeVisible();
    expect(screen.getByRole('button', { name: /Keep task for today/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Move task to backlog/i })).toBeVisible();
  });

  it('uses high-contrast amber badge for Rolled Over', () => {
    render(<RolloverTaskCard task={sample} onAction={vi.fn()} />);
    const badge = screen.getByTestId('rollover-status-badge');
    for (const token of plannerRolloverBadgeClassName.split(' ')) {
      expect(badge.className).toContain(token);
    }
    expect(badge.className).not.toContain('slate-500/25');
  });

  it('uses high-contrast rose badge for Overdue', () => {
    render(<RolloverTaskCard task={{ ...sample, badge: 'Overdue' }} onAction={vi.fn()} />);
    const badge = screen.getByTestId('rollover-status-badge');
    for (const token of plannerRolloverOverdueBadgeClassName.split(' ')) {
      expect(badge.className).toContain(token);
    }
  });

  it('uses left-accent card shell for column prominence', () => {
    render(<RolloverTaskCard task={sample} onAction={vi.fn()} />);
    const card = screen.getByTestId('rollover-card-task-1');
    expect(card.className).toContain('border-l-4');
    for (const token of plannerRolloverCardClassName.split(' ')) {
      expect(card.className).toContain(token);
    }
  });

  it('activates Keep via Tab + Enter', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<RolloverTaskCard task={sample} onAction={onAction} />);
    await user.tab();
    expect(screen.getByRole('button', { name: /Keep task for today/i })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('2026-05-21#task-1', 'keep');
  });

  it('activates Backlog via Tab + Enter', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<RolloverTaskCard task={sample} onAction={onAction} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: /Move task to backlog/i })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('2026-05-21#task-1', 'backlog');
  });

  it('disables buttons when disabled', () => {
    render(<RolloverTaskCard task={sample} disabled onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Keep task for today/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Move task to backlog/i })).toBeDisabled();
  });

  it('shows velocity drag badge when rolloverCount >= 3', () => {
    render(
      <RolloverTaskCard
        task={{ ...sample, rolloverCount: 3, velocityDragDetected: true }}
        onAction={vi.fn()}
      />
    );
    expect(screen.getByTestId('velocity-drag-badge')).toBeInTheDocument();
  });

  it('shows loading label for pending action', () => {
    render(<RolloverTaskCard task={sample} pendingAction="backlog" onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Moving task to backlog/i })).toBeDisabled();
  });
});
