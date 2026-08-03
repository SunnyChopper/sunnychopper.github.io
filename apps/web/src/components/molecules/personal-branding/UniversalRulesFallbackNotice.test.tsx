import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import UniversalRulesFallbackNotice from './UniversalRulesFallbackNotice';

describe('UniversalRulesFallbackNotice', () => {
  it('shows universal-only copy by default', () => {
    render(
      <MemoryRouter>
        <UniversalRulesFallbackNotice platformLabel="LinkedIn" />
      </MemoryRouter>
    );

    expect(screen.getByText('Universal fallback')).toBeInTheDocument();
    expect(screen.getByText(/module-wide universal rules/i)).toBeInTheDocument();
  });

  it('shows zero-rules copy when mode is none', () => {
    render(
      <MemoryRouter>
        <UniversalRulesFallbackNotice platformLabel="Instagram" mode="none" />
      </MemoryRouter>
    );

    expect(screen.getByText(/No saved platform rules for Instagram/i)).toBeInTheDocument();
    expect(screen.getByText(/profile voice only/i)).toBeInTheDocument();
    expect(screen.queryByText(/module-wide universal rules/i)).not.toBeInTheDocument();
  });
});
