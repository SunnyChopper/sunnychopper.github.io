import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PointsEarnBurst } from './PointsEarnBurst';

const useReducedMotion = vi.fn(() => false);

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => useReducedMotion(),
  };
});

describe('PointsEarnBurst', () => {
  beforeEach(() => {
    useReducedMotion.mockReturnValue(false);
  });

  it('renders children and +N particle when motion is allowed', () => {
    const { rerender } = render(
      <PointsEarnBurst pulseKey={1} delta={5}>
        <span>10 pts</span>
      </PointsEarnBurst>
    );

    expect(screen.getByText('10 pts')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();

    rerender(
      <PointsEarnBurst pulseKey={2} delta={8}>
        <span>18 pts</span>
      </PointsEarnBurst>
    );

    expect(screen.getByText('18 pts')).toBeInTheDocument();
    expect(screen.getByText('+8')).toBeInTheDocument();
  });

  it('skips particle when reduced motion is preferred', () => {
    useReducedMotion.mockReturnValue(true);

    render(
      <PointsEarnBurst pulseKey={1} delta={5}>
        <span>10 pts</span>
      </PointsEarnBurst>
    );

    expect(screen.getByText('10 pts')).toBeInTheDocument();
    expect(screen.queryByText('+5')).not.toBeInTheDocument();
  });

  it('skips particle when delta is zero or negative', () => {
    render(
      <PointsEarnBurst pulseKey={1} delta={0}>
        <span>10 pts</span>
      </PointsEarnBurst>
    );

    expect(screen.getByText('10 pts')).toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument();
  });
});
