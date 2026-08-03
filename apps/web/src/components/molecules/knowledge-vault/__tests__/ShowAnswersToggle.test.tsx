import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ShowAnswersToggle } from '@/components/molecules/knowledge-vault/ShowAnswersToggle';

describe('ShowAnswersToggle', () => {
  it('renders as an accessible switch with label', () => {
    render(<ShowAnswersToggle checked={false} onChange={() => {}} />);
    const toggle = screen.getByRole('switch', { name: 'Show answers' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('Show answers')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    render(<ShowAnswersToggle checked onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Show answers' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('calls onChange with toggled value on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ShowAnswersToggle checked={false} onChange={onChange} />);
    await user.click(screen.getByRole('switch', { name: 'Show answers' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('is keyboard activatable', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ShowAnswersToggle checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Show answers' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
