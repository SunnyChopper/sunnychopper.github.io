import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { rewardsService } from '../../services/rewards';
import { useWallet } from '../Wallet';
import {
  RewardsContext,
  type RewardsContextType,
  type RewardWithRedemptions,
  type Reward,
  type RewardCategory,
  type CreateRewardInput,
  type UpdateRewardInput,
} from './types';

interface RewardsProviderProps {
  children: ReactNode;
}

export const RewardsProvider = ({ children }: RewardsProviderProps) => {
  const [rewards, setRewards] = useState<RewardWithRedemptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { spendPoints, refreshWallet } = useWallet();

  const refreshRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getAllWithRedemptions();

      if (response.success && response.data) {
        setRewards(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rewards';
      setError(errorMessage);
      console.error('Error loading rewards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRewards();
  }, [refreshRewards]);

  const getRewardsByCategory = useCallback(
    (category: RewardCategory) => {
      return rewards.filter((r) => r.category === category);
    },
    [rewards]
  );

  const createReward = useCallback(
    async (input: CreateRewardInput): Promise<Reward> => {
      try {
        setError(null);
        const response = await rewardsService.create(input);

        if (response.success && response.data) {
          await refreshRewards();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to create reward');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create reward';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshRewards]
  );

  const updateReward = useCallback(
    async (id: string, input: UpdateRewardInput): Promise<Reward> => {
      try {
        setError(null);
        const response = await rewardsService.update(id, input);

        if (response.success && response.data) {
          await refreshRewards();
          return response.data;
        } else {
          throw new Error(response.error || 'Failed to update reward');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update reward';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshRewards]
  );

  const deleteReward = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        const response = await rewardsService.delete(id);

        if (response.success) {
          await refreshRewards();
        } else {
          throw new Error(response.error || 'Failed to delete reward');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete reward';
        setError(errorMessage);
        throw err;
      }
    },
    [refreshRewards]
  );

  const redeemReward = useCallback(
    async (rewardId: string, notes?: string): Promise<void> => {
      try {
        setError(null);

        const reward = rewards.find((r) => r.id === rewardId);
        if (!reward) {
          throw new Error('Reward not found');
        }

        if (!reward.canRedeem) {
          throw new Error(reward.cooldownMessage || 'Cannot redeem this reward');
        }

        const redemptionResponse = await rewardsService.redeem({ rewardId, notes });

        if (!redemptionResponse.success || !redemptionResponse.data) {
          throw new Error(redemptionResponse.error || 'Failed to redeem reward');
        }

        await spendPoints(
          reward.pointCost,
          'reward_redemption',
          `Redeemed: ${reward.title}`,
          'reward',
          rewardId
        );

        await Promise.all([refreshRewards(), refreshWallet()]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to redeem reward';
        setError(errorMessage);
        throw err;
      }
    },
    [rewards, spendPoints, refreshRewards, refreshWallet]
  );

  const value: RewardsContextType = {
    rewards,
    loading,
    error,
    refreshRewards,
    getRewardsByCategory,
    createReward,
    updateReward,
    deleteReward,
    redeemReward,
  };

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
};
