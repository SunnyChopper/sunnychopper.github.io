import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityIndicator } from '@/components/atoms/PriorityIndicator';

describe('PriorityIndicator', () => {
  it('exposes accessible name with number and intent on badge variant', () => {
    render(<PriorityIndicator priority="P1" variant="badge" />);

    const badge = screen.getByText('P1');
    expect(badge).toHaveAttribute('aria-label', 'Priority P1: Critical/Urgent');
    expect(badge).toHaveAttribute('title', 'Priority P1: Critical/Urgent');
  });

  it('exposes accessible name on dot variant via role=img', () => {
    render(<PriorityIndicator priority="P2" variant="dot" />);

    const dot = screen.getByRole('img', { name: 'Priority P2: High' });
    expect(dot).toHaveAttribute('title', 'Priority P2: High');
  });

  it('falls back to P3 when priority is missing', () => {
    render(<PriorityIndicator priority={undefined} variant="badge" />);

    const badge = screen.getByText('P3');
    expect(badge).toHaveAttribute('aria-label', 'Priority P3: Medium');
  });
});
