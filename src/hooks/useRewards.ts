import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsService } from '@/services/rewards';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import { queryKeys } from '@/lib/react-query/query-keys';
import { extractApiError, isNetworkError } from '@/lib/react-query/error-utils';
import type { CreateRewardInput, UpdateRewardInput, RewardCategory } from '@/types/rewards';

/**
 * Hook to fetch all rewards with redemptions
 */
export function useRewards() {
  const { recordError, recordSuccess } = useBackendStatus();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: queryKeys.rewards.withRedemptions(),
    queryFn: async () => {
      try {
        const result = await rewardsService.getAllWithRedemptions();
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
    staleTime: 10 * 60 * 1000, // 10 minutes - rewards rarely change
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const apiError = error ? extractApiError(error) : null;

  return {
    rewards: data?.data || [],
    isLoading: isLoading && !isError,
    isError,
    error: apiError || error,
  };
}

/**
 * Helper function to get rewards by category
 */
export function useRewardsByCategory(category: RewardCategory) {
  const { rewards } = useRewards();
  return rewards.filter((r) => r.category === category);
}

/**
 * Hook for reward mutations
 */
export function useRewardMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateRewardInput) => rewardsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRewardInput }) =>
      rewardsService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rewardsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: ({ rewardId, notes }: { rewardId: string; notes?: string }) =>
      rewardsService.redeem({ rewardId, notes }),
    onSuccess: () => {
      // Invalidate both rewards and wallet queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.growthSystem.all });
    },
  });

  return {
    createReward: createMutation.mutateAsync,
    updateReward: updateMutation.mutateAsync,
    deleteReward: deleteMutation.mutateAsync,
    redeemReward: redeemMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isRedeeming: redeemMutation.isPending,
  };
}
