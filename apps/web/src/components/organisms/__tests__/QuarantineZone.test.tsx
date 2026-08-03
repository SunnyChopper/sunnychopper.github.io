import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { QuarantineZone } from '@/components/organisms/QuarantineZone';
import type {
  WeeklyReviewQuarantineCandidate,
  WeeklyReviewQuarantineDecision,
} from '@/types/growth-system';

const candidates: WeeklyReviewQuarantineCandidate[] = [
  {
    entityType: 'goal',
    entityId: 'g1',
    name: 'Secure Top-Tier MSAI Admission',
    reason: 'Due date is in the past',
  },
  {
    entityType: 'project',
    entityId: 'p1',
    name: 'Polish the Public Garden',
    reason: 'No activity in 45 days',
  },
];

describe('QuarantineZone', () => {
  it('renders empty state when no candidates', () => {
    render(<QuarantineZone candidates={[]} decisions={[]} onChange={vi.fn()} />);
    expect(screen.getByText(/No quarantine candidates — slate is clear/i)).toBeInTheDocument();
  });

  it('renders candidate names and reasons', () => {
    render(<QuarantineZone candidates={candidates} decisions={[]} onChange={vi.fn()} />);
    expect(screen.getByText('Secure Top-Tier MSAI Admission')).toBeInTheDocument();
    expect(screen.getByText('Due date is in the past')).toBeInTheDocument();
    expect(screen.getByText('Polish the Public Garden')).toBeInTheDocument();
  });

  it('applies accent bar and stronger amber surface on cards', () => {
    const { container } = render(
      <QuarantineZone candidates={[candidates[0]]} decisions={[]} onChange={vi.fn()} />
    );
    const card = container.querySelector('.border-l-4');
    expect(card).toBeTruthy();
    expect(card?.className).toMatch(/bg-amber-50\/90/);
    expect(card?.className).toMatch(/border-l-amber-500/);
  });

  it('styles Revive as primary and Reschedule/Delete as outline when idle', () => {
    render(<QuarantineZone candidates={[candidates[0]]} decisions={[]} onChange={vi.fn()} />);
    const revive = screen.getByRole('button', { name: /Revive/i });
    const reschedule = screen.getByRole('button', { name: /Reschedule/i });
    const del = screen.getByRole('button', { name: /Delete/i });

    expect(revive.className).toMatch(/bg-emerald-600/);
    expect(reschedule.className).toMatch(/border/);
    expect(reschedule.className).not.toMatch(/bg-emerald-600/);
    expect(del.className).toMatch(/border/);
    expect(del.className).not.toMatch(/bg-emerald-600/);
  });

  it('demotes Revive to outline when Reschedule is selected', () => {
    const decisions: WeeklyReviewQuarantineDecision[] = [
      { entityType: 'goal', entityId: 'g1', action: 'schedule' },
    ];
    render(
      <QuarantineZone candidates={[candidates[0]]} decisions={decisions} onChange={vi.fn()} />
    );
    const revive = screen.getByRole('button', { name: /Revive/i });
    const reschedule = screen.getByRole('button', { name: /Reschedule/i });

    expect(revive.className).toMatch(/border/);
    expect(revive.className).not.toMatch(/bg-emerald-600/);
    expect(reschedule.className).toMatch(/bg-blue-600/);
  });

  it('records revive, schedule, and delete decisions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuarantineZone candidates={[candidates[0]]} decisions={[]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /Revive/i }));
    expect(onChange).toHaveBeenLastCalledWith([
      { entityType: 'goal', entityId: 'g1', action: 'revive' },
    ]);

    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: /Reschedule/i }));
    expect(onChange).toHaveBeenLastCalledWith([
      { entityType: 'goal', entityId: 'g1', action: 'schedule' },
    ]);

    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: /Delete/i }));
    expect(onChange).toHaveBeenLastCalledWith([
      { entityType: 'goal', entityId: 'g1', action: 'delete' },
    ]);
  });

  it('does not change decisions when readOnly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<QuarantineZone candidates={candidates} decisions={[]} onChange={onChange} readOnly />);
    await user.click(screen.getAllByRole('button', { name: /Revive/i })[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
