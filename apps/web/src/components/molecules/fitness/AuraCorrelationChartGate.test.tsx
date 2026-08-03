import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuraCorrelationChartGate } from '@/components/molecules/fitness/AuraCorrelationChartGate';
import type { AuraPoint } from '@/types/fitness';

function makePoint(date: string, xValue = 7, yStoryPoints = 5): AuraPoint {
  return { date, xValue, yStoryPoints, recovery: null };
}

function renderGate(points: AuraPoint[], onLogRecovery = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuraCorrelationChartGate
        points={points}
        xMetric="sleepHours"
        onLogRecovery={onLogRecovery}
      />
    </MemoryRouter>
  );
}

describe('AuraCorrelationChartGate', () => {
  it('shows empty state with illustration, progress title, and CTA when n is 0', () => {
    const onLogRecovery = vi.fn();
    const { container } = renderGate([], onLogRecovery);

    expect(
      screen.getByRole('status', { name: '0 of 7 days with both signals' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '0 of 7 days with both signals' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Need days with a recovery X metric and story-point activity in this window.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log recovery' })).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Aura scatter: recovery metric vs story points')
    ).not.toBeInTheDocument();
  });

  it('fires log recovery CTA from empty state', async () => {
    const user = userEvent.setup();
    const onLogRecovery = vi.fn();
    renderGate([], onLogRecovery);

    await user.click(screen.getByRole('button', { name: 'Log recovery' }));
    expect(onLogRecovery).toHaveBeenCalledTimes(1);
  });

  it('shows same empty state chrome with live progress title when 1 <= n < 7', () => {
    const points = Array.from({ length: 4 }, (_, i) =>
      makePoint(`2026-07-${String(i + 1).padStart(2, '0')}`)
    );
    const { container } = renderGate(points);

    expect(
      screen.getByRole('status', { name: '4 of 7 days with both signals' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '4 of 7 days with both signals' })
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('4/7')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log recovery' })).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Aura scatter: recovery metric vs story points')
    ).not.toBeInTheDocument();
  });

  it('renders scatter chart when n >= 7', () => {
    const points = Array.from({ length: 7 }, (_, i) =>
      makePoint(`2026-07-${String(i + 1).padStart(2, '0')}`)
    );
    renderGate(points);

    expect(
      screen.getByLabelText('Aura scatter: recovery metric vs story points')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '0 of 7 days with both signals' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '4 of 7 days with both signals' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('4/7')).not.toBeInTheDocument();
  });
});
