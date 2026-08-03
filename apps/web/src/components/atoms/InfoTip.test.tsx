import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import InfoTip from '@/components/atoms/InfoTip';

describe('InfoTip', () => {
  it('shows tooltip on focus and hides on Escape', async () => {
    const user = userEvent.setup();
    render(
      <InfoTip label="Help for narrative mode">
        <p>Tell a story.</p>
        <p>Example: Once upon a time.</p>
      </InfoTip>
    );

    const trigger = screen.getByRole('button', { name: 'Help for narrative mode' });
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tell a story.')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('toggles tooltip on click without losing trigger', async () => {
    const user = userEvent.setup();
    render(
      <InfoTip label="Device help">
        <p>Direct comparison.</p>
      </InfoTip>
    );

    const trigger = screen.getByRole('button', { name: 'Device help' });
    await user.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
