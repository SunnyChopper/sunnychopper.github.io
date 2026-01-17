import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { walletService } from '../../services/rewards';
import {
  WalletContext,
  type WalletContextType,
  type WalletBalance,
  type WalletTransaction,
} from './types';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [balanceResponse, transactionsResponse] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(50),
      ]);

      if (balanceResponse.success && balanceResponse.data) {
        setBalance(balanceResponse.data);
      } else {
        setError(balanceResponse.error);
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wallet';
      setError(errorMessage);
      console.error('Error loading wallet:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const addPoints = useCallback(
    async (
      amount: number,
      source: WalletTransaction['source'],
      description: string,
      sourceEntityType?: 'task' | 'reward' | null,
      sourceEntityId?: string | null
    ) => {
      try {
        setError(null);
        const response = await walletService.addPoints(
          amount,
          source,
          description,
          sourceEntityType,
          sourceEntityId
        );

        if (response.success && response.data) {
          setBalance(response.data.balance);
          setTransactions((prev) => [response.data!.transaction, ...prev]);
        } else {
          setError(response.error);
          throw new Error(response.error || 'Failed to add points');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add points';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const spendPoints = useCallback(
    async (
      amount: number,
      source: WalletTransaction['source'],
      description: string,
      sourceEntityType?: 'task' | 'reward' | null,
      sourceEntityId?: string | null
    ) => {
      try {
        setError(null);
        const response = await walletService.spendPoints(
          amount,
          source,
          description,
          sourceEntityType,
          sourceEntityId
        );

        if (response.success && response.data) {
          setBalance(response.data.balance);
          setTransactions((prev) => [response.data!.transaction, ...prev]);
        } else {
          setError(response.error);
          throw new Error(response.error || 'Failed to spend points');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to spend points';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const value: WalletContextType = {
    balance,
    transactions,
    loading,
    error,
    refreshWallet,
    addPoints,
    spendPoints,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
