import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TodaysWorkoutStrip } from '@/components/molecules/fitness/TodaysWorkoutStrip';
import type { TodaysStripState } from '@/lib/fitness/todays-workout-strip';

const today = '2026-07-29';

describe('TodaysWorkoutStrip', () => {
  it('renders rest day status without action', () => {
    const state: TodaysStripState = { mode: 'rest', label: 'Rest day' };
    render(<TodaysWorkoutStrip state={state} today={today} />);

    expect(screen.getByRole('status')).toHaveTextContent('Rest day');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders ready state with Start session action', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const state: TodaysStripState = {
      mode: 'ready',
      templateId: 'tpl-push',
      templateName: 'Push day A',
    };

    render(<TodaysWorkoutStrip state={state} today={today} onStart={onStart} />);

    expect(screen.getByText('Push day A')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start session' }));
    expect(onStart).toHaveBeenCalledWith('tpl-push');
  });

  it('renders completed state', () => {
    const state: TodaysStripState = {
      mode: 'completed',
      templateName: 'Push day A',
    };
    render(<TodaysWorkoutStrip state={state} today={today} />);

    expect(screen.getByRole('status')).toHaveTextContent('Completed');
    expect(screen.getByText(/Push day A/)).toBeInTheDocument();
  });

  it('renders in_progress with continue action', async () => {
    const user = userEvent.setup();
    const onContinueSession = vi.fn();
    const state: TodaysStripState = {
      mode: 'in_progress',
      sessionId: 'sess-1',
      templateName: 'Push day A',
    };

    render(
      <TodaysWorkoutStrip state={state} today={today} onContinueSession={onContinueSession} />
    );

    await user.click(screen.getByRole('button', { name: 'Continue session' }));
    expect(onContinueSession).toHaveBeenCalledWith('sess-1');
  });
});
