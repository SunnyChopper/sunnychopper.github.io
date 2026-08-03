import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { FocusGoalRow } from '@/components/molecules/FocusGoalRow';
import type { Goal } from '@/types/growth-system';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => true,
  };
});

const baseGoal: Goal = {
  id: 'goal-1',
  title: 'Sleep & System Startup',
  description: null,
  area: 'Health',
  subCategory: null,
  timeHorizon: 'Weekly',
  priority: 'P1',
  status: 'Active',
  health: null,
  startDate: '2026-01-01',
  targetDate: '2026-05-01',
  completedDate: null,
  successCriteria: [],
  progressConfig: null,
  parentGoalId: null,
  lastActivityAt: null,
  notes: null,
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function renderRow(props: Partial<ComponentProps<typeof FocusGoalRow>> = {}) {
  return render(
    <MemoryRouter>
      <FocusGoalRow
        goal={baseGoal}
        progress={props.progress ?? 0}
        daysRemaining={props.daysRemaining ?? -62}
        {...props}
      />
    </MemoryRouter>
  );
}

describe('FocusGoalRow', () => {
  it('clamps progress bar width above 100', () => {
    renderRow({ progress: 150 });

    const bar = screen.getByRole('progressbar', { name: /Sleep & System Startup progress/i });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar.querySelector('motion.div, div')?.getAttribute('style')).toContain('width: 100%');
  });

  it('renders calm overdue pill without pulse animation classes', () => {
    const { container } = renderRow({ daysRemaining: -62 });

    expect(screen.getByText('62d overdue')).toBeInTheDocument();
    expect(container.querySelector('.animate-border-pulse-red')).not.toBeInTheDocument();
    expect(container.querySelector('.border-l-red-500')).toBeInTheDocument();
  });

  it('exposes overdue aria label on date chip', () => {
    renderRow({ daysRemaining: -62 });

    expect(screen.getByLabelText('62 days overdue')).toBeInTheDocument();
  });

  it('shows priority, area, and cadence meta', () => {
    renderRow({ daysRemaining: 5, progress: 25 });

    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('25% complete')).toBeInTheDocument();
  });
});
