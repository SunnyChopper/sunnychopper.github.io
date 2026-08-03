import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssistantMemoryIngestionForm } from './AssistantMemoryIngestionForm';
import { emptyFactCriteria } from '@/lib/settings/assistantMemoryIngestionFactCriteria';

const baseProps = {
  catalog: null,
  provider: 'groq',
  model: 'llama-3.1-8b-instant',
  factCriteria: emptyFactCriteria(),
  onProviderChange: vi.fn(),
  onModelChange: vi.fn(),
  onFactCriteriaChange: vi.fn(),
  disabled: false,
};

describe('AssistantMemoryIngestionForm', () => {
  it('shows calm empty states for fact filter lists', () => {
    render(<AssistantMemoryIngestionForm {...baseProps} />);

    expect(screen.getByText('No rules yet.')).toBeInTheDocument();
    expect(screen.getByText('No exclusions yet.')).toBeInTheDocument();
  });

  it('adds an always-capture rule row', () => {
    const onFactCriteriaChange = vi.fn();
    render(
      <AssistantMemoryIngestionForm {...baseProps} onFactCriteriaChange={onFactCriteriaChange} />
    );

    fireEvent.click(screen.getAllByRole('button', { name: '+ Add rule' })[0]!);
    expect(onFactCriteriaChange).toHaveBeenCalledWith({
      alwaysCapture: [''],
      neverCapture: [],
    });
  });

  it('does not add more than 20 always-capture rules', () => {
    const alwaysCapture = Array.from({ length: 20 }, (_, i) => `rule-${i}`);
    render(
      <AssistantMemoryIngestionForm
        {...baseProps}
        factCriteria={{ alwaysCapture, neverCapture: [] }}
      />
    );

    const addButtons = screen.getAllByRole('button', { name: '+ Add rule' });
    expect(addButtons[0]).toBeDisabled();
  });

  it('removes a filled rule chip instantly', () => {
    const onFactCriteriaChange = vi.fn();
    render(
      <AssistantMemoryIngestionForm
        {...baseProps}
        factCriteria={{ alwaysCapture: ['capital changes'], neverCapture: [] }}
        onFactCriteriaChange={onFactCriteriaChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove rule' }));
    expect(onFactCriteriaChange).toHaveBeenCalledWith({
      alwaysCapture: [],
      neverCapture: [],
    });
  });

  it('does not render reset control inside the form', () => {
    render(<AssistantMemoryIngestionForm {...baseProps} />);

    expect(
      screen.queryByRole('button', { name: 'Reset to server defaults' })
    ).not.toBeInTheDocument();
  });
});
