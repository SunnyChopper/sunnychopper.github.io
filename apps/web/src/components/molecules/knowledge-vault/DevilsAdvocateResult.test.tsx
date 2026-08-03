import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DevilsAdvocateResult } from '@/components/molecules/knowledge-vault/DevilsAdvocateResult';

const samplePayload = {
  fallacies: [],
  unsupported_claims: [],
  counter_arguments: [],
  missing_evidence: [
    'No quantitative benchmarks: token-cost reduction from caching',
    'No discussion of verification: tests missing',
  ],
  contradictions: ['Claims X and not-X'],
};

describe('DevilsAdvocateResult', () => {
  it('renders non-empty sections collapsed with readable headers and counts', () => {
    render(<DevilsAdvocateResult data={samplePayload} />);

    expect(screen.getByRole('button', { name: /Missing evidence/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.queryByText('Fallacies')).not.toBeInTheDocument();
    expect(screen.queryByText('{')).not.toBeInTheDocument();
    expect(screen.queryByText('[')).not.toBeInTheDocument();
  });

  it('expands one section independently and shows formatted bullets', async () => {
    const user = userEvent.setup();
    render(<DevilsAdvocateResult data={samplePayload} />);

    const missingEvidence = screen.getByRole('button', { name: /Missing evidence/i });
    await user.click(missingEvidence);

    expect(missingEvidence).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('No quantitative benchmarks:')).toBeInTheDocument();
    expect(screen.getByText(/token-cost reduction from caching/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Contradictions/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('shows empty state for malformed payloads with no sections', () => {
    render(<DevilsAdvocateResult data={{ fallacies: 'bad' }} />);
    expect(screen.getByText('No critique sections returned.')).toBeInTheDocument();
  });
});
