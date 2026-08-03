import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlannerCapacityMeter } from '../PlannerCapacityMeter';

describe('PlannerCapacityMeter', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(0), 0) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function getFill() {
    return screen.getByTestId('planner-capacity-fill');
  }

  it('shows overloaded styling for high load', () => {
    render(
      <PlannerCapacityMeter
        loadRatio={1.2}
        capacityState="overloaded"
        scheduledPoints={6}
        capacityPoints={5}
      />
    );
    expect(screen.getByText('Over capacity')).toBeInTheDocument();
    expect(screen.getByText(/6\.0 \/ 5\.0 pts/)).toBeInTheDocument();
  });

  it('shows blocked state with zero capacity', () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0}
        capacityState="blocked"
        scheduledPoints={0}
        capacityPoints={0}
      />
    );
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('0 pts capacity')).toBeInTheDocument();
    expect(getFill()).toHaveStyle({ width: '0%' });
  });

  it('shows healthy state', () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0.5}
        capacityState="healthy"
        scheduledPoints={2}
        capacityPoints={5}
      />
    );
    expect(screen.getByText('Capacity')).toBeInTheDocument();
  });

  it('hides capacity track in empty variant while keeping label', () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0}
        capacityState="healthy"
        scheduledPoints={0}
        capacityPoints={3.4}
        variant="empty"
      />
    );
    expect(screen.getByText('Capacity')).toBeInTheDocument();
    expect(screen.getByText('0.0 / 3.4 pts')).toBeInTheDocument();
    expect(screen.queryByTestId('planner-capacity-fill')).not.toBeInTheDocument();
  });

  it('uses width transition classes capped at 200ms', () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0.4}
        capacityState="healthy"
        scheduledPoints={2}
        capacityPoints={5}
      />
    );
    const fill = getFill();
    expect(fill.className).toContain('transition-[width]');
    expect(fill.className).toContain('duration-200');
    expect(fill.className).toContain('motion-reduce:transition-none');
  });

  it('animates fill from zero to target on mount when load is non-zero', async () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0.5}
        capacityState="healthy"
        scheduledPoints={2.5}
        capacityPoints={5}
      />
    );

    expect(getFill()).toHaveStyle({ width: '0%' });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(getFill()).toHaveStyle({ width: '50%' });
    });
  });

  it('keeps zero-load days empty with no fill growth', async () => {
    render(
      <PlannerCapacityMeter
        loadRatio={0}
        capacityState="healthy"
        scheduledPoints={0}
        capacityPoints={5}
      />
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getFill()).toHaveStyle({ width: '0%' });
  });

  it('transitions fill width when load changes after schedule or keep', async () => {
    const { rerender } = render(
      <PlannerCapacityMeter
        loadRatio={0.4}
        capacityState="healthy"
        scheduledPoints={2}
        capacityPoints={5}
      />
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(getFill()).toHaveStyle({ width: '40%' });
    });

    rerender(
      <PlannerCapacityMeter
        loadRatio={0.8}
        capacityState="warning"
        scheduledPoints={4}
        capacityPoints={5}
      />
    );

    await waitFor(() => {
      expect(getFill()).toHaveStyle({ width: '80%' });
    });
  });
});
