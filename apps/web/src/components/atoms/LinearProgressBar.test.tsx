import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LinearProgressBar from './LinearProgressBar';

describe('LinearProgressBar', () => {
  it('exposes progressbar semantics and clamps width', () => {
    render(<LinearProgressBar value={150} max={100} label="Spend utilization" />);
    const bar = screen.getByRole('progressbar', { name: 'Spend utilization' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar.querySelector('div')?.style.width).toBe('100%');
  });

  it('renders zero when max is zero', () => {
    render(<LinearProgressBar value={5} max={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
