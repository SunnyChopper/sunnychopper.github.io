import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useWallet, useWalletMutations } from '@/hooks/useWallet';
import { useQueryClient } from '@tanstack/react-query';
import { WalletContext, type WalletContextType, type WalletTransaction } from './types';

const EARN_PULSE_CLEAR_MS = 600;

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { balance, transactions, loading, isRefreshing, error } = useWallet();
  const { addPoints: addPointsMutation, spendPoints: spendPointsMutation } = useWalletMutations();
  const queryClient = useQueryClient();
  const [earnPulse, setEarnPulse] = useState<WalletContextType['earnPulse']>(null);
  const earnPulseIdRef = useRef(0);
  const earnPulseClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEarnPulse = useCallback((amount: number) => {
    if (amount <= 0) return;
    earnPulseIdRef.current += 1;
    setEarnPulse({ id: earnPulseIdRef.current, amount });
    if (earnPulseClearRef.current) {
      clearTimeout(earnPulseClearRef.current);
    }
    earnPulseClearRef.current = setTimeout(() => {
      setEarnPulse(null);
      earnPulseClearRef.current = null;
    }, EARN_PULSE_CLEAR_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (earnPulseClearRef.current) {
        clearTimeout(earnPulseClearRef.current);
      }
    };
  }, []);

  const refreshWallet = useCallback(async () => {
    // Invalidate queries to trigger refetch
    await queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }, [queryClient]);

  const addPoints = useCallback(
    async (
      amount: number,
      source: WalletTransaction['source'],
      description: string,
      sourceEntityType?: 'task' | 'reward' | null,
      sourceEntityId?: string | null
    ) => {
      await addPointsMutation({
        amount,
        source,
        description,
        sourceEntityType,
        sourceEntityId,
      });
    },
    [addPointsMutation]
  );

  const spendPoints = useCallback(
    async (
      amount: number,
      source: WalletTransaction['source'],
      description: string,
      sourceEntityType?: 'task' | 'reward' | null,
      sourceEntityId?: string | null
    ) => {
      await spendPointsMutation({
        amount,
        source,
        description,
        sourceEntityType,
        sourceEntityId,
      });
    },
    [spendPointsMutation]
  );

  const value: WalletContextType = {
    balance,
    transactions,
    loading,
    isRefreshing,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    earnPulse,
    triggerEarnPulse,
    refreshWallet,
    addPoints,
    spendPoints,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
