import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AUTO_COMPLETED_TOOLTIP } from '@/lib/weekly-review/auto-completed-tooltip';
import { WeeklyReviewAutoCompletedBadge } from './WeeklyReviewAutoCompletedBadge';

describe('WeeklyReviewAutoCompletedBadge', () => {
  it('renders the Auto-completed label with secondary styling', () => {
    render(<WeeklyReviewAutoCompletedBadge />);

    const badge = screen.getByRole('status', { name: 'Auto-completed' });
    expect(badge).toHaveTextContent('Auto-completed');
    expect(badge.className).not.toMatch(/violet-/);
    expect(badge.className).not.toMatch(/font-semibold/);
    expect(badge.className).toMatch(/font-medium/);
    expect(badge.className).toMatch(/text-slate-500/);
  });

  it('hides tooltip copy by default', () => {
    render(<WeeklyReviewAutoCompletedBadge />);

    expect(screen.queryByText(AUTO_COMPLETED_TOOLTIP)).not.toBeInTheDocument();
  });

  it('reveals tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<WeeklyReviewAutoCompletedBadge />);

    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent(AUTO_COMPLETED_TOOLTIP);
  });

  it('reveals tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<WeeklyReviewAutoCompletedBadge />);

    await user.hover(screen.getByRole('status', { name: 'Auto-completed' }));
    expect(screen.getByRole('tooltip')).toHaveTextContent(AUTO_COMPLETED_TOOLTIP);
  });
});
