import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import OutputTestToneScorecard from './OutputTestToneScorecard';

describe('OutputTestToneScorecard', () => {
  it('shows empty hint when profile has no tone metrics', () => {
    render(<OutputTestToneScorecard targets={{}} onBiasMetric={vi.fn()} />);
    expect(screen.getByText(/add tone metrics/i)).toBeInTheDocument();
  });

  it('renders score bars and handles metric click', async () => {
    const user = userEvent.setup();
    const onBiasMetric = vi.fn();
    render(
      <OutputTestToneScorecard
        scores={{ clarity: 0.82, warmth: 0.55 }}
        targets={{ clarity: 0.9, warmth: 0.6 }}
        overallToneMatch={0.685}
        onBiasMetric={onBiasMetric}
      />
    );

    expect(screen.getByText(/overall 69%/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /regenerate with more Clarity/i }));
    expect(onBiasMetric).toHaveBeenCalledWith('clarity');
  });

  it('shows scoring failed message when scores are missing', () => {
    render(
      <OutputTestToneScorecard targets={{ clarity: 0.9 }} isScoringFailed onBiasMetric={vi.fn()} />
    );
    expect(screen.getByText(/could not score this preview/i)).toBeInTheDocument();
  });
});
