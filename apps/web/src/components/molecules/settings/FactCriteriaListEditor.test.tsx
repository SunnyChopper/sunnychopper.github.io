import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FactCriteriaListEditor } from './FactCriteriaListEditor';
import { MAX_FACT_CRITERIA_ITEMS } from '@/lib/settings/assistantMemoryIngestionFactCriteria';

describe('FactCriteriaListEditor', () => {
  it('shows empty message when there are no items', () => {
    render(
      <FactCriteriaListEditor
        idPrefix="test"
        title="Always capture"
        emptyMessage="No rules yet."
        items={[]}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('No rules yet.')).toBeInTheDocument();
    expect(screen.getByText(`0 / ${MAX_FACT_CRITERIA_ITEMS}`)).toBeInTheDocument();
  });

  it('renders filled rules as removable chips', () => {
    const onChange = vi.fn();
    render(
      <FactCriteriaListEditor
        idPrefix="test"
        title="Always capture"
        emptyMessage="No rules yet."
        items={['capital changes']}
        onChange={onChange}
      />
    );

    expect(screen.getByRole('button', { name: 'capital changes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove rule' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
