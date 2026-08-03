import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { WeeklyReviewProjectsMovedStrip } from '@/components/organisms/WeeklyReviewProjectsMovedStrip';

describe('WeeklyReviewProjectsMovedStrip', () => {
  it('renders nothing when projects list is empty', () => {
    const { container } = render(
      <MemoryRouter>
        <WeeklyReviewProjectsMovedStrip projects={[]} />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders project chips with signed deltas and deep links', () => {
    render(
      <MemoryRouter>
        <WeeklyReviewProjectsMovedStrip
          projects={[
            {
              projectId: 'p1',
              projectName: 'Alpha Launch',
              status: 'Active',
              healthScore: 72.5,
              healthScoreDelta: 8.3,
              completionPercentage: 50,
              completionPercentageDelta: 25,
              tasksCompletedInWeek: 1,
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Projects that moved')).toBeInTheDocument();
    expect(screen.getByText('Alpha Launch')).toBeInTheDocument();
    expect(screen.getByText('+8.3')).toBeInTheDocument();
    expect(screen.getByText('+25%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Alpha Launch/i })).toHaveAttribute(
      'href',
      '/admin/projects?projectId=p1'
    );
  });
});
