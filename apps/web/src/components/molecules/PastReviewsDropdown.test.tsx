import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PastReviewsDropdown } from './PastReviewsDropdown';

const reviews = [
  { weekStart: '2026-07-20', status: 'completed' as const, autoCompleted: true },
  { weekStart: '2026-07-13', status: 'completed' as const, autoCompleted: true },
  { weekStart: '2026-07-06', status: 'completed' as const, autoCompleted: true },
  { weekStart: '2026-06-29', status: 'completed' as const, autoCompleted: true },
  { weekStart: '2026-06-22', status: 'completed' as const, autoCompleted: true },
];

describe('PastReviewsDropdown', () => {
  it('shows current/auto on trigger when no week selected', () => {
    render(
      <PastReviewsDropdown
        reviews={reviews}
        anchorWeekStart="2026-07-27"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /current \/ auto/i })).toBeInTheDocument();
  });

  it('renders month groups with sticky headers and relative labels when open', async () => {
    const user = userEvent.setup();
    render(
      <PastReviewsDropdown
        reviews={reviews}
        anchorWeekStart="2026-07-27"
        value=""
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /current \/ auto/i }));

    const listbox = screen.getByRole('listbox', { name: /past reviews/i });
    expect(within(listbox).getByText('July 2026')).toBeInTheDocument();
    expect(within(listbox).getByText('June 2026')).toBeInTheDocument();
    expect(within(listbox).getByText('Last week')).toBeInTheDocument();
    expect(within(listbox).getByText('2 weeks ago')).toBeInTheDocument();
    expect(within(listbox).getByText('3 weeks ago')).toBeInTheDocument();
    expect(
      within(listbox).getByText('Week of 2026-07-20 (completed · auto-completed)')
    ).toBeInTheDocument();

    const julyHeader = within(listbox).getByText('July 2026');
    expect(julyHeader.className).toMatch(/sticky/);
  });

  it('calls onChange with weekStart when a review is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PastReviewsDropdown
        reviews={reviews}
        anchorWeekStart="2026-07-27"
        value=""
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /current \/ auto/i }));
    await user.click(screen.getByRole('option', { name: /last week/i }));

    expect(onChange).toHaveBeenCalledWith('2026-07-20');
  });

  it('calls onChange with null when Current / auto is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <PastReviewsDropdown
        reviews={reviews}
        anchorWeekStart="2026-07-27"
        value="2026-07-20"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /last week/i }));
    await user.click(screen.getByRole('option', { name: /^current \/ auto$/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
