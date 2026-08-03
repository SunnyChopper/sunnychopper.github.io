import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuraChartToolbar } from '@/components/molecules/fitness/AuraChartToolbar';

describe('AuraChartToolbar', () => {
  it('renders range pills, X axis select, and vs story points label', () => {
    const { container } = render(
      <AuraChartToolbar
        preset="30d"
        onPresetChange={vi.fn()}
        xMetric="sleepHours"
        onXMetricChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole('toolbar', { name: 'Aura chart range and X axis' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2y' })).toBeInTheDocument();
    expect(screen.getByLabelText('X axis')).toBeInTheDocument();
    expect(screen.getByText('vs story points')).toBeInTheDocument();

    const toolbar = container.querySelector('[role="toolbar"]');
    expect(toolbar?.className).toMatch(/sticky/);
    expect(toolbar?.className).toMatch(/top-16/);
  });

  it('fires preset change when a range pill is clicked', async () => {
    const user = userEvent.setup();
    const onPresetChange = vi.fn();
    render(
      <AuraChartToolbar
        preset="30d"
        onPresetChange={onPresetChange}
        xMetric="sleepHours"
        onXMetricChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '7d' }));
    expect(onPresetChange).toHaveBeenCalledWith('7d');
  });

  it('fires x metric change when select value changes', async () => {
    const user = userEvent.setup();
    const onXMetricChange = vi.fn();
    render(
      <AuraChartToolbar
        preset="30d"
        onPresetChange={vi.fn()}
        xMetric="sleepHours"
        onXMetricChange={onXMetricChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('X axis'), 'energyLevel');
    expect(onXMetricChange).toHaveBeenCalledWith('energyLevel');
  });

  it('includes sleep debt in X axis options', () => {
    render(
      <AuraChartToolbar
        preset="30d"
        onPresetChange={vi.fn()}
        xMetric="sleepHours"
        onXMetricChange={vi.fn()}
      />
    );

    expect(screen.getByRole('option', { name: 'Sleep debt (7d)' })).toBeInTheDocument();
  });
});
