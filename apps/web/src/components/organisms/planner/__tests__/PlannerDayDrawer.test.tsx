import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { PlannerDayDrawer } from '@/components/organisms/planner/PlannerDayDrawer';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

vi.mock('@/components/molecules/OverlayPortal', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/organisms/planner/PlannerDayFocusPanel', () => ({
  PlannerDayFocusPanel: () => <div data-testid="planner-day-focus-panel">Focus panel</div>,
}));

describe('PlannerDayDrawer', () => {
  it('renders calendar teaser in footer outside the scrollable focus panel', () => {
    const { container } = render(
      <MemoryRouter>
        <PlannerDayDrawer
          open
          focusDateISO="2026-07-29"
          onClose={vi.fn()}
          onFocusDateChange={vi.fn()}
        />
      </MemoryRouter>
    );

    const focusPanel = screen.getByTestId('planner-day-focus-panel');
    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    const scrollRegion = focusPanel.parentElement;
    const footerRegion = settingsLink.closest('.shrink-0');

    expect(scrollRegion).toHaveClass('overflow-y-auto');
    expect(footerRegion).not.toBe(scrollRegion);
    expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
  });
});
