import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CostGuardrailBanner from '@/components/molecules/observability/CostGuardrailBanner';
import { observabilityService } from '@/services/observability.service';

vi.mock('@/services/observability.service', () => ({
  observabilityService: {
    getCostGuardrails: vi.fn(),
  },
}));

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CostGuardrailBanner', () => {
  it('renders nothing when banner is inactive', async () => {
    vi.mocked(observabilityService.getCostGuardrails).mockResolvedValue({
      rules: [],
      banner: { active: false, messages: [] },
      throttleAllowlist: [],
      overrides: {},
    });
    const { container } = wrap(<CostGuardrailBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows messages and manage link when active', async () => {
    vi.mocked(observabilityService.getCostGuardrails).mockResolvedValue({
      rules: [],
      banner: {
        active: true,
        messages: ['personal_branding daily budget exceeded ($6.00 / $5.00).'],
      },
      throttleAllowlist: [],
      overrides: {},
    });
    wrap(<CostGuardrailBanner />);
    expect(
      await screen.findByText('personal_branding daily budget exceeded ($6.00 / $5.00).')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage cost guardrails/i })).toHaveAttribute(
      'href',
      '/admin/assistant/observability?tab=cost'
    );
  });
});
