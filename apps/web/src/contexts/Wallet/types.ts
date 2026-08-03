import { createContext } from 'react';
import type { WalletBalance, WalletTransaction } from '@/types/rewards';

export type WalletEarnPulse = {
  id: number;
  amount: number;
};

export interface WalletContextType {
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  loading: boolean;
  /** Wallet queries refetching after invalidation (e.g. task status → clawback). */
  isRefreshing: boolean;
  error: string | null;
  /** Active earn pulse for sidebar badge animation (manual claim success). */
  earnPulse: WalletEarnPulse | null;
  triggerEarnPulse: (amount: number) => void;
  refreshWallet: () => Promise<void>;
  addPoints: (
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ) => Promise<void>;
  spendPoints: (
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Re-export types for convenience
export type { WalletBalance, WalletTransaction };
