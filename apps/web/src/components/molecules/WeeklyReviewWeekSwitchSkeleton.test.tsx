import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeeklyReviewWeekSwitchSkeleton } from '@/components/molecules/WeeklyReviewWeekSwitchSkeleton';

describe('WeeklyReviewWeekSwitchSkeleton', () => {
  it('renders root with aria-busy and expected placeholder counts', () => {
    render(<WeeklyReviewWeekSwitchSkeleton />);

    const root = screen.getByTestId('weekly-review-week-switch-skeleton');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(root).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Loading weekly review…')).toHaveClass('sr-only');

    expect(screen.getAllByTestId('weekly-review-stat-tile-skeleton')).toHaveLength(5);
    expect(screen.getByTestId('weekly-review-velocity-chart-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-review-wow-narrative-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('weekly-review-insight-card-skeleton')).toHaveLength(3);
  });
});
