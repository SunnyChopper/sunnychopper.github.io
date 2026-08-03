import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HabitVelocityInsightCallout } from '@/components/molecules/HabitVelocityInsightCallout';
import { habitsDeepLinkHref } from '@/lib/growth-system/habits-deep-links';
import type { HabitVelocityCorrelation } from '@/types/growth-system';

const sample: HabitVelocityCorrelation = {
  habitId: 'h1',
  habitName: 'Lift',
  habitArea: 'Health',
  habitSubCategory: 'Exercise',
  consistencyThresholdPct: 80,
  trailingWeeks: 8,
  sampleWeeks: 8,
  highBucketWeeks: 3,
  lowBucketWeeks: 2,
  highBucketAvgStoryPoints: 18,
  lowBucketAvgStoryPoints: 10,
  upliftPct: 80,
};

function renderCallout(correlations: HabitVelocityCorrelation[] | undefined) {
  return render(
    <MemoryRouter>
      <HabitVelocityInsightCallout correlations={correlations} />
    </MemoryRouter>
  );
}

describe('HabitVelocityInsightCallout', () => {
  it('renders nothing when correlations are undefined', () => {
    const { container } = renderCallout(undefined);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when correlations are empty', () => {
    const { container } = renderCallout([]);
    expect(container.firstChild).toBeNull();
  });

  it('renders primary kinetic momentum copy with one deep-link', () => {
    renderCallout([sample]);
    const callout = screen.getByRole('status');
    expect(callout).toBeInTheDocument();
    expect(screen.getByText(/Kinetic Momentum:/)).toBeInTheDocument();
    expect(screen.getByText(/\+80%/)).toBeInTheDocument();
    expect(screen.getByText(/18 vs 10/)).toBeInTheDocument();
    expect(screen.getByText(/last 8 weeks/)).toBeInTheDocument();
    const links = callout.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Open Lift' })).toHaveAttribute(
      'href',
      habitsDeepLinkHref('h1')
    );
  });

  it('renders secondary line for runner-up correlation without a second link', () => {
    const runner: HabitVelocityCorrelation = {
      ...sample,
      habitId: 'h2',
      habitName: 'Morning walk',
      upliftPct: 22.5,
    };
    renderCallout([sample, runner]);
    expect(screen.getByText(/Also:/)).toBeInTheDocument();
    expect(screen.getByText(/Morning walk/)).toBeInTheDocument();
    expect(screen.getByText(/22\.5/)).toBeInTheDocument();
    const callout = screen.getByRole('status');
    expect(callout.querySelectorAll('a')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Open Lift' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Morning walk' })).not.toBeInTheDocument();
  });
});
