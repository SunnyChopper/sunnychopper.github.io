import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import HealthFitnessRewardsPage from '../HealthFitnessRewardsPage';
import * as useFitness from '@/hooks/useFitness';

const triggerEarnPulse = vi.fn();

vi.mock('@/contexts/Wallet', () => ({
  useWallet: () => ({
    triggerEarnPulse,
    earnPulse: null,
    balance: null,
    transactions: [],
    loading: false,
    isRefreshing: false,
    error: null,
    refreshWallet: vi.fn(),
    addPoints: vi.fn(),
    spendPoints: vi.fn(),
  }),
}));

vi.mock('@/hooks/useFitness', () => ({
  useFitnessRewardRules: vi.fn(() => ({
    data: {
      success: true,
      data: {
        data: [
          {
            id: 'r1',
            userId: 'u1',
            name: 'Water',
            description: null,
            category: 'hydration',
            points: 5,
            target: '12oz',
            triggerType: 'manual',
            autoMetric: null,
            exerciseId: null,
            cooldownHours: null,
            maxClaimsPerDay: null,
            isActive: true,
            createdAt: '2026-05-28T00:00:00Z',
            updatedAt: '2026-05-28T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 100,
        hasMore: false,
      },
    },
    isLoading: false,
  })),
  useFitnessRewardClaims: vi.fn(() => ({
    data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 30, hasMore: false } },
  })),
  useFitnessExercises: vi.fn(() => ({
    data: { success: true, data: { data: [], total: 0, page: 1, pageSize: 100, hasMore: false } },
  })),
  useCreateRewardRuleMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateRewardRuleMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteRewardRuleMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useClaimRewardRuleMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

const defaultRule = {
  id: 'r1',
  userId: 'u1',
  name: 'Water',
  description: null,
  category: 'hydration' as const,
  points: 5,
  target: '12oz',
  triggerType: 'manual' as const,
  autoMetric: null,
  exerciseId: null,
  cooldownHours: null,
  maxClaimsPerDay: null,
  isActive: true,
  createdAt: '2026-05-28T00:00:00Z',
  updatedAt: '2026-05-28T00:00:00Z',
};

function mockDefaultFitnessQueries() {
  vi.mocked(useFitness.useFitnessRewardRules).mockReturnValue({
    data: {
      success: true,
      data: {
        data: [defaultRule],
        total: 1,
        page: 1,
        pageSize: 100,
        hasMore: false,
      },
    },
    isLoading: false,
  } as unknown as ReturnType<typeof useFitness.useFitnessRewardRules>);
  vi.mocked(useFitness.useClaimRewardRuleMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useFitness.useClaimRewardRuleMutation>);
}

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <HealthFitnessRewardsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('HealthFitnessRewardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDefaultFitnessQueries();
  });

  it('renders Rewards heading and manual quick claim', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Rewards' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Water (+5)' })).toBeInTheDocument();
  });

  it('renders differentiated empty states when rules and claims are empty', async () => {
    vi.mocked(useFitness.useFitnessRewardRules).mockReturnValue({
      data: {
        success: true,
        data: { data: [], total: 0, page: 1, pageSize: 100, hasMore: false },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useFitness.useFitnessRewardRules>);

    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No manual claims ready' })).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: 'Create a rule to start earning' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No claims in the last 14 days' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Create or activate a manual rule to claim points here.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Points rules feed your wallet — add one to begin.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Claim or auto-earn points and they will show up here.')
    ).toBeInTheDocument();

    const newRuleButtons = screen.getAllByRole('button', { name: /new rule/i });
    expect(newRuleButtons).toHaveLength(4);

    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
  });

  it('shows Claim points CTA on recent claims empty when manual rules exist', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'No claims in the last 14 days' })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Claim points' })).toBeInTheDocument();
  });

  it('focuses first quick claim chip from recent claims empty CTA', async () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Claim points' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Claim points' }));

    const quickClaimButton = screen.getByRole('button', { name: 'Water (+5)' });
    expect(scrollIntoView).toHaveBeenCalled();
    expect(quickClaimButton).toHaveFocus();
  });

  it('opens rule dialog with FormInput name field focused', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /new rule/i })[0]);

    const nameInput = await screen.findByLabelText(/^Name/);
    expect(nameInput).toBeInTheDocument();
    await waitFor(() => {
      expect(nameInput).toHaveFocus();
    });
  });

  it('updates live rule preview as form fields change', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getAllByRole('button', { name: /new rule/i })[0]);

    const preview = await screen.findByText('Earn 10 pts (manual, custom)');
    expect(preview).toHaveAttribute('aria-live', 'polite');

    const nameInput = screen.getByLabelText(/^Name/);
    fireEvent.change(nameInput, { target: { value: 'Water' } });
    await waitFor(() => {
      expect(preview).toHaveTextContent('Earn 10 pts for Water (manual, custom)');
    });

    const pointsInput = screen.getByLabelText(/^Points/);
    fireEvent.change(pointsInput, { target: { value: '15' } });
    await waitFor(() => {
      expect(preview).toHaveTextContent('Earn 15 pts for Water (manual, custom)');
    });

    fireEvent.change(screen.getByLabelText(/^Category/), { target: { value: 'hydration' } });
    await waitFor(() => {
      expect(preview).toHaveTextContent('Earn 15 pts for Water (manual, hydration)');
    });

    await user.click(screen.getByRole('button', { name: /show advanced/i }));
    fireEvent.change(screen.getByLabelText(/Target \(optional\)/i), {
      target: { value: '12 oz water' },
    });
    fireEvent.change(screen.getByLabelText(/Max \/ day/i), { target: { value: '3' } });
    await waitFor(() => {
      expect(preview).toHaveTextContent(
        'Earn 15 pts for every 12 oz water (manual, hydration, max 3/day)'
      );
    });
  });

  it('triggers earn pulse and live status on successful manual claim', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      success: true,
      data: {
        claim: {
          id: 'c1',
          userId: 'u1',
          ruleId: 'r1',
          ruleName: 'Water',
          points: 5,
          source: 'manual',
          createdAt: '2026-07-29T00:00:00Z',
        },
        walletBalance: 105,
      },
    });
    vi.mocked(useFitness.useClaimRewardRuleMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useFitness.useClaimRewardRuleMutation>);

    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Water (+5)' }));

    await waitFor(() => {
      expect(triggerEarnPulse).toHaveBeenCalledWith(5);
    });
    expect(screen.getByText('Claimed +5 points')).toBeInTheDocument();
    expect(screen.getByText('105 pts')).toBeInTheDocument();
  });
});
