import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { PlannerCalendarOverlay } from '@/components/organisms/planner/PlannerCalendarOverlay';
import { ROUTES } from '@/routes';

describe('PlannerCalendarOverlay', () => {
  it('renders muted footer copy with Settings link to admin settings', () => {
    render(
      <MemoryRouter>
        <PlannerCalendarOverlay />
      </MemoryRouter>
    );

    expect(screen.getByText(/Calendar sync — connect Google in/i)).toBeInTheDocument();
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute('href', ROUTES.admin.settings);
  });

  it('does not show developer API path or dashed callout styling', () => {
    const { container } = render(
      <MemoryRouter>
        <PlannerCalendarOverlay />
      </MemoryRouter>
    );

    expect(screen.queryByText(/\/integrations\/calendars/)).not.toBeInTheDocument();
    expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Calendar$/)).not.toBeInTheDocument();
  });
});
