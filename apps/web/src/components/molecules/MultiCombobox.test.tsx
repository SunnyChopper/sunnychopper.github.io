import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import MultiCombobox from '@/components/molecules/MultiCombobox';

describe('MultiCombobox', () => {
  it('adds a selected option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiCombobox value={[]} onChange={onChange} options={['One', 'Two']} placeholder="Add" />
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'One' }));
    expect(onChange).toHaveBeenCalledWith(['One']);
  });

  it('hides selected pills when hideSelectedPills is true', () => {
    render(
      <MultiCombobox
        value={['One']}
        onChange={vi.fn()}
        options={['One', 'Two']}
        placeholder="Add"
        hideSelectedPills
      />
    );
    expect(screen.queryByLabelText('Remove One')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
