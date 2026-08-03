import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BurnBreakdownActions from '@/components/molecules/observability/BurnBreakdownActions';
import { observabilityService } from '@/services/observability.service';
import type { CostGuardrailStatus } from '@/types/observability';

vi.mock('@/services/observability.service', () => ({
  observabilityService: {
    putCostGuardrails: vi.fn(),
    postCostGuardrailOverride: vi.fn(),
  },
}));

const throttleAllowlist = ['contentStreamXShortPosts'];

function makeGuardrails(rules: CostGuardrailStatus['rules'] = []): CostGuardrailStatus {
  return {
    rules,
    banner: { active: false, messages: [] },
    throttleAllowlist,
    overrides: {},
  };
}

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('BurnBreakdownActions budget alert dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(observabilityService.putCostGuardrails).mockResolvedValue(makeGuardrails());
  });

  it('renders one-sentence soft-budget helper when opened', async () => {
    const user = userEvent.setup();
    wrap(
      <BurnBreakdownActions
        rowKey="contentStreamXShortPosts"
        groupBy="feature"
        guardrails={makeGuardrails()}
      />
    );

    await user.click(screen.getByRole('button', { name: /set budget alert/i }));

    expect(
      screen.getByText(
        'Soft USD budget for this feature — auto-throttle only pauses it when exceeded.'
      )
    ).toBeInTheDocument();
  });

  it('shows inline limit error after invalid interaction', async () => {
    const user = userEvent.setup();
    wrap(
      <BurnBreakdownActions
        rowKey="contentStreamXShortPosts"
        groupBy="feature"
        guardrails={makeGuardrails()}
      />
    );

    await user.click(screen.getByRole('button', { name: /set budget alert/i }));

    const limitInput = screen.getByLabelText(/limit \(usd\)/i);
    await user.clear(limitInput);
    await user.type(limitInput, '0');
    await user.tab();

    expect(screen.getByText('Enter a limit greater than 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save alert/i })).toBeDisabled();
  });

  it('uses secondary cancel and primary submit buttons', async () => {
    const user = userEvent.setup();
    wrap(
      <BurnBreakdownActions
        rowKey="contentStreamXShortPosts"
        groupBy="feature"
        guardrails={makeGuardrails()}
      />
    );

    await user.click(screen.getByRole('button', { name: /set budget alert/i }));

    const cancel = screen.getByRole('button', { name: /cancel/i });
    const save = screen.getByRole('button', { name: /save alert/i });

    expect(cancel).toHaveClass('border-primary');
    expect(save).toHaveClass('bg-primary');
    expect(save).toHaveAttribute('type', 'submit');
  });

  it('prefills from an existing matching feature rule', async () => {
    const user = userEvent.setup();
    wrap(
      <BurnBreakdownActions
        rowKey="contentStreamXShortPosts"
        groupBy="feature"
        guardrails={makeGuardrails([
          {
            id: 'rule-1',
            enabled: true,
            scopeType: 'feature',
            module: 'personal_branding',
            feature: 'contentStreamXShortPosts',
            period: 'weekly',
            limitUsd: 12.5,
            autoThrottle: false,
            spentUsd: 3,
            remainingUsd: 9.5,
            exceeded: false,
            utilizationPct: 24,
            approaching: false,
            periodStart: null,
            periodEnd: null,
            throttledFeatures: [],
          },
        ])}
      />
    );

    await user.click(screen.getByRole('button', { name: /set budget alert/i }));

    expect(screen.getByLabelText(/limit \(usd\)/i)).toHaveValue(12.5);
    expect(screen.getByLabelText(/period/i)).toHaveValue('weekly');
    expect(
      screen.getByRole('checkbox', { name: /auto-throttle when exceeded/i })
    ).not.toBeChecked();
  });
});
