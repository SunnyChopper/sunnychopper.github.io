import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FeynmanExplanationHistoryStrip } from '@/components/molecules/knowledge-vault/FeynmanExplanationHistoryStrip';

describe('FeynmanExplanationHistoryStrip', () => {
  it('renders nothing when explanations is empty', () => {
    const { container } = render(
      <FeynmanExplanationHistoryStrip explanations={[]} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders chips newest-first in given order', () => {
    render(
      <FeynmanExplanationHistoryStrip
        explanations={['Newest', 'Middle', 'Oldest']}
        onSelect={vi.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('Newest');
    expect(buttons[1]).toHaveTextContent('Middle');
    expect(buttons[2]).toHaveTextContent('Oldest');
  });

  it('calls onSelect with full text when chip clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const fullText = 'A longer explanation about quantum tunneling';
    render(<FeynmanExplanationHistoryStrip explanations={[fullText]} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /Restore explanation 1/i }));
    expect(onSelect).toHaveBeenCalledWith(fullText);
  });

  it('disables chips when disabled prop is true', () => {
    render(<FeynmanExplanationHistoryStrip explanations={['One']} onSelect={vi.fn()} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
