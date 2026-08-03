import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletWidget } from './WalletWidget';

const useWallet = vi.fn();

vi.mock('@/contexts/Wallet', () => ({
  useWallet: () => useWallet(),
}));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

describe('WalletWidget', () => {
  beforeEach(() => {
    useWallet.mockReturnValue({
      balance: {
        totalPoints: 250,
        lifetimeEarned: 300,
        lifetimeSpent: 50,
      },
      transactions: [],
      loading: false,
      isRefreshing: false,
      earnPulse: null,
      error: null,
      triggerEarnPulse: vi.fn(),
      refreshWallet: vi.fn(),
      addPoints: vi.fn(),
      spendPoints: vi.fn(),
    });
  });

  it('shows balance and earn pulse particle when earnPulse is active', () => {
    useWallet.mockReturnValue({
      balance: {
        totalPoints: 255,
        lifetimeEarned: 305,
        lifetimeSpent: 50,
      },
      transactions: [],
      loading: false,
      isRefreshing: true,
      earnPulse: { id: 1, amount: 5 },
      error: null,
      triggerEarnPulse: vi.fn(),
      refreshWallet: vi.fn(),
      addPoints: vi.fn(),
      spendPoints: vi.fn(),
    });

    render(<WalletWidget />);

    expect(screen.getByText('255')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.queryByLabelText('Updating wallet balance')).not.toBeInTheDocument();
  });
});
