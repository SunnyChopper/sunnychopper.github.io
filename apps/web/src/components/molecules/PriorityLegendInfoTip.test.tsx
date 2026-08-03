import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import PriorityLegendInfoTip from '@/components/molecules/PriorityLegendInfoTip';

describe('PriorityLegendInfoTip', () => {
  it('shows trigger with accessible label and P1–P4 intent text when opened', async () => {
    const user = userEvent.setup();
    render(<PriorityLegendInfoTip />);

    const trigger = screen.getByRole('button', { name: 'What P1–P4 mean' });
    await user.click(trigger);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('P1 — Critical/Urgent')).toBeInTheDocument();
    expect(screen.getByText('P2 — High')).toBeInTheDocument();
    expect(screen.getByText('P3 — Medium')).toBeInTheDocument();
    expect(screen.getByText('P4 — Low')).toBeInTheDocument();
  });
});
