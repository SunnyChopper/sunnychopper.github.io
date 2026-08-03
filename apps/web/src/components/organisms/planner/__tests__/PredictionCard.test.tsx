import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PredictionCard } from '@/components/organisms/planner/PredictionCard';
import type { PlanDayPrediction } from '@/types/planner';

const basePrediction = (partial: Partial<PlanDayPrediction> = {}): PlanDayPrediction => ({
  date: '2026-05-18',
  dayOfWeek: 0,
  predictedCapacityPoints: 5,
  confidence: 'low',
  todayActualPoints: 0,
  trailingDailyAverage: 1,
  dayOfWeekHistory: [
    {
      dayOfWeek: 0,
      averagePoints: 6,
      medianPoints: 5,
      samples: 2,
    },
    ...Array.from({ length: 6 }).map((_, idx) => ({
      dayOfWeek: idx + 1,
      averagePoints: 0,
      medianPoints: 0,
      samples: 0,
    })),
  ],
  ...partial,
});

describe('PredictionCard', () => {
  it('surfaces estimated default copy when confidence is low', () => {
    const prediction = basePrediction();
    render(<PredictionCard prediction={prediction} focusDateISO="2026-05-18" />);
    expect(screen.getByText(/Estimated default/)).toBeInTheDocument();
  });

  it('shows weekday average copy sourced from planner history bucket', () => {
    render(<PredictionCard prediction={basePrediction()} focusDateISO="2026-05-18" />);
    expect(screen.getByText(/Mon/)).toBeInTheDocument();
    expect(screen.getByText(/6\.0/)).toBeInTheDocument();
    expect(screen.getByText(/2 samples/)).toBeInTheDocument();
  });

  it('shows Clear Out of Office when manually blocked', () => {
    const onClear = vi.fn();
    render(
      <PredictionCard
        prediction={basePrediction({
          isBlocked: true,
          predictedCapacityPoints: 0,
          blockingContexts: [
            {
              id: 'exc-1',
              source: 'manual',
              kind: 'outOfOffice',
              label: 'Out of Office',
              startDate: '2026-05-18',
              endDate: '2026-05-18',
              isManual: true,
            },
          ],
        })}
        focusDateISO="2026-05-18"
        onClearOutOfOffice={onClear}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear Out of Office for this day' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('explains non-manual blocked source without clear button', () => {
    render(
      <PredictionCard
        prediction={basePrediction({
          isBlocked: true,
          predictedCapacityPoints: 0,
          blockingContexts: [
            {
              id: 'c1',
              source: 'calendar',
              kind: 'outOfOffice',
              label: 'Vacation',
              startDate: '2026-05-18',
              endDate: '2026-05-18',
              isManual: false,
            },
          ],
        })}
        focusDateISO="2026-05-18"
        onClearOutOfOffice={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /Clear Out of Office/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Blocked by Calendar event: Vacation/)).toBeInTheDocument();
  });
});
