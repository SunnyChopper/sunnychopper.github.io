import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { WeeklyReviewProjectRisks } from '@/components/organisms/WeeklyReviewProjectRisks';

describe('WeeklyReviewProjectRisks', () => {
  it('renders affirmative empty state when no pinned projects', () => {
    render(
      <MemoryRouter>
        <WeeklyReviewProjectRisks assessments={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/No pinned projects — pin one from Risk Assessment to include here/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/No pinned projects this week/i)).not.toBeInTheDocument();
  });
});
