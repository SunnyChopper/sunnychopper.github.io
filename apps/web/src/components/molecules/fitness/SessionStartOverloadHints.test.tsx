import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SessionStartOverloadHints } from '@/components/molecules/fitness/SessionStartOverloadHints';
import type { OverloadSuggestion } from '@/types/fitness';

const baseHint = (
  exerciseId: string,
  overrides: Partial<OverloadSuggestion> = {}
): OverloadSuggestion => ({
  exerciseId,
  nextSuggestedWeight: 137.5,
  nextSuggestedTargetRepsMin: 5,
  nextSuggestedTargetRepsMax: 8,
  recommendationReason: 'Last session hit targets; add load for progressive overload.',
  basedOnSessionId: 'sess-1',
  consecutiveFailedSessions: 0,
  unit: 'pounds',
  lastSuccessfulWeight: 135,
  lastSuccessfulCompletedReps: 5,
  lastSuccessfulSessionId: 'sess-0',
  lastSuccessfulSessionDate: '2026-04-18',
  ...overrides,
});

describe('SessionStartOverloadHints', () => {
  it('renders session plan rows with last success and next target', () => {
    render(
      <SessionStartOverloadHints
        suggestions={[baseHint('ex-squat')]}
        nameById={{ 'ex-squat': 'Squat' }}
        onSelectExercise={vi.fn()}
      />
    );

    expect(screen.getByRole('region', { name: 'Session plan' })).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText(/Last success:/)).toHaveTextContent('135 × 5 pounds');
    expect(screen.getByText(/137\.5/)).toBeInTheDocument();
  });

  it('calls onSelectExercise when row clicked', async () => {
    const user = userEvent.setup();
    const onSelectExercise = vi.fn();

    render(
      <SessionStartOverloadHints
        suggestions={[baseHint('ex-row')]}
        nameById={{ 'ex-row': 'Row' }}
        onSelectExercise={onSelectExercise}
      />
    );

    await user.click(screen.getByRole('button', { name: /Row/ }));
    expect(onSelectExercise).toHaveBeenCalledWith('ex-row');
  });

  it('shows no-history fallback when last success missing', () => {
    render(
      <SessionStartOverloadHints
        suggestions={[
          baseHint('ex-new', {
            lastSuccessfulWeight: null,
            lastSuccessfulCompletedReps: null,
            lastSuccessfulSessionId: null,
            lastSuccessfulSessionDate: null,
            nextSuggestedWeight: 45,
            recommendationReason: 'No history for this lift; start conservative and log sets.',
          }),
        ]}
        nameById={{ 'ex-new': 'Press' }}
        onSelectExercise={vi.fn()}
      />
    );

    expect(screen.getByText('No successful history yet')).toBeInTheDocument();
    expect(screen.getByText(/No history for this lift/)).toBeInTheDocument();
  });
});
