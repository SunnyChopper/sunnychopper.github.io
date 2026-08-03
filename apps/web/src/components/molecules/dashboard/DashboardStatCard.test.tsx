import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { CheckSquare } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DashboardStatCard } from '@/components/molecules/dashboard/DashboardStatCard';

function renderCard(overrides: Partial<ComponentProps<typeof DashboardStatCard>> = {}) {
  return render(
    <MemoryRouter>
      <DashboardStatCard
        title="Active Tasks"
        value={12}
        icon={<CheckSquare size={24} />}
        link="/admin/tasks"
        description="24 total tasks"
        {...overrides}
      />
    </MemoryRouter>
  );
}

describe('DashboardStatCard', () => {
  it('renders loaded hierarchy with dominant value number', () => {
    renderCard();

    const link = screen.getByRole('link', { name: /Active Tasks/i });
    expect(link).toHaveAttribute('aria-busy', 'false');
    expect(link.className).toContain('focus-visible:ring-2');
    expect(link.className).toContain('h-full');

    const value = screen.getByRole('heading', { level: 3, name: '12' });
    expect(value).toHaveClass('text-3xl', 'font-bold', 'tabular-nums');
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    expect(screen.getByText('24 total tasks')).toBeInTheDocument();
  });

  it('shows geometry-matched skeleton while loading without misleading zeros', () => {
    renderCard({ isLoading: true, value: 0 });

    const link = screen.getByRole('link', { name: /Active Tasks/i });
    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Active Tasks')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('24 total tasks')).not.toBeInTheDocument();

    const skeletonBars = link.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletonBars).toHaveLength(2);
    expect(skeletonBars[0]?.className).toContain('h-9');
    expect(skeletonBars[0]?.className).toContain('w-16');
    expect(skeletonBars[1]?.className).toContain('h-4');
  });

  it('includes focus-visible ring classes on the card link', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /Active Tasks/i });
    expect(link.className).toMatch(/focus-visible:ring-2/);
    expect(link.className).toMatch(/focus-visible:ring-blue-500/);
  });
});
