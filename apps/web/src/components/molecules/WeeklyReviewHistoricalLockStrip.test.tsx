import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WeeklyReviewHistoricalLockStrip } from './WeeklyReviewHistoricalLockStrip';

const HISTORICAL_TOOLTIP =
  'This snapshot is read-only. Numbers and AI text reflect the saved review, not live task completion.';

describe('WeeklyReviewHistoricalLockStrip', () => {
  it('shows short historical label and hides long copy by default', () => {
    render(<WeeklyReviewHistoricalLockStrip variant="historical" />);

    expect(
      screen.getByRole('status', { name: /Historical week · read-only/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Historical week · read-only')).toBeInTheDocument();
    expect(screen.queryByText(HISTORICAL_TOOLTIP)).not.toBeInTheDocument();
    expect(screen.getByRole('status').className).toMatch(/sticky/);
  });

  it('shows locked label for completed live week variant', () => {
    render(<WeeklyReviewHistoricalLockStrip variant="locked" />);

    expect(screen.getByText('Week locked in · read-only')).toBeInTheDocument();
    expect(
      screen.queryByText(/Planning actions and sprint updates are closed/i)
    ).not.toBeInTheDocument();
  });

  it('reveals tooltip on lock button focus', async () => {
    const user = userEvent.setup();
    render(<WeeklyReviewHistoricalLockStrip variant="historical" />);

    await user.tab();
    expect(screen.getByRole('tooltip')).toHaveTextContent(HISTORICAL_TOOLTIP);
  });
});
