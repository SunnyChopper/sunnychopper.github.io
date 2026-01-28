import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletService } from '@/services/rewards';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import { queryKeys } from '@/lib/react-query/query-keys';
import { extractApiError, isNetworkError } from '@/lib/react-query/error-utils';
import { applyWalletUpdate } from '@/lib/react-query/growth-system-cache';
import type { WalletTransaction } from '@/types/rewards';

/**
 * Hook to fetch wallet balance
 */
export function useWalletBalance() {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: async () => {
      try {
        const result = await walletService.getBalance();
        if (result.success && result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - balance doesn't change that frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    balance: data?.data || null,
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Hook to fetch wallet transactions
 */
export function useWalletTransactions(limit: number = 50) {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.wallet.transactions(limit),
    queryFn: async () => {
      try {
        const result = await walletService.getTransactions(limit);
        if (result.success && result.data) {
          recordSuccess();
        }
        return result;
      } catch (err: unknown) {
        const apiError = extractApiError(err);
        if (apiError && isNetworkError(apiError)) {
          recordError(apiError);
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - transactions don't change that frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    transactions: data?.data || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Combined hook for wallet balance and transactions
 */
export function useWallet() {
  const balanceQuery = useWalletBalance();
  const transactionsQuery = useWalletTransactions(50);

  return {
    balance: balanceQuery.balance,
    transactions: transactionsQuery.transactions,
    loading: balanceQuery.isLoading || transactionsQuery.isLoading,
    error: balanceQuery.error || transactionsQuery.error,
    isError: balanceQuery.isError || transactionsQuery.isError,
  };
}

/**
 * Hook for wallet mutations (add/spend points)
 */
export function useWalletMutations() {
  const queryClient = useQueryClient();

  const addPointsMutation = useMutation({
    mutationFn: async ({
      amount,
      source,
      description,
      sourceEntityType,
      sourceEntityId,
    }: {
      amount: number;
      source: WalletTransaction['source'];
      description: string;
      sourceEntityType?: 'task' | 'reward' | null;
      sourceEntityId?: string | null;
    }) => {
      return walletService.addPoints(amount, source, description, sourceEntityType, sourceEntityId);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        applyWalletUpdate(queryClient, response.data);
      }
    },
  });

  const spendPointsMutation = useMutation({
    mutationFn: async ({
      amount,
      source,
      description,
      sourceEntityType,
      sourceEntityId,
    }: {
      amount: number;
      source: WalletTransaction['source'];
      description: string;
      sourceEntityType?: 'task' | 'reward' | null;
      sourceEntityId?: string | null;
    }) => {
      return walletService.spendPoints(
        amount,
        source,
        description,
        sourceEntityType,
        sourceEntityId
      );
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        applyWalletUpdate(queryClient, response.data);
      }
    },
  });

  return {
    addPoints: addPointsMutation.mutateAsync,
    spendPoints: spendPointsMutation.mutateAsync,
    isAdding: addPointsMutation.isPending,
    isSpending: spendPointsMutation.isPending,
  };
}
