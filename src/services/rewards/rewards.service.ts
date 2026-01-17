import { apiClient } from '../../lib/api-client';
import type {
  Reward,
  RewardRedemption,
  CreateRewardInput,
  UpdateRewardInput,
  RedeemRewardInput,
  RewardWithRedemptions,
  RewardCategory,
} from '../../types/rewards';
import type { ApiResponse } from '../../types/api-contracts';

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function _canRedeemReward(
  reward: Reward,
  redemptions: RewardRedemption[]
): { canRedeem: boolean; cooldownMessage: string | null } {
  if (reward.status !== 'Active') {
    return { canRedeem: false, cooldownMessage: 'Reward is not active' };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayRedemptions = redemptions.filter((r) => new Date(r.redeemedAt) >= todayStart);

  if (reward.maxRedemptionsPerDay && todayRedemptions.length >= reward.maxRedemptionsPerDay) {
    return {
      canRedeem: false,
      cooldownMessage: 'Daily redemption limit reached',
    };
  }

  if (reward.cooldownHours && redemptions.length > 0) {
    const lastRedemption = redemptions.sort(
      (a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
    )[0];
    const cooldownEnd = new Date(
      new Date(lastRedemption.redeemedAt).getTime() + reward.cooldownHours * 60 * 60 * 1000
    );

    if (now < cooldownEnd) {
      const hoursLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
      return {
        canRedeem: false,
        cooldownMessage: `Available in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`,
      };
    }
  }

  return { canRedeem: true, cooldownMessage: null };
}

export const rewardsService = {
  async getAll(): Promise<ApiResponse<Reward[]>> {
    const response = await apiClient.get<BackendPaginatedResponse<Reward>>('/rewards');
    if (response.success && response.data) {
      return { data: response.data.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to fetch rewards',
      success: false,
    };
  },

  async getById(id: string): Promise<ApiResponse<Reward>> {
    const response = await apiClient.get<Reward>(`/rewards/${id}`);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Reward not found',
      success: false,
    };
  },

  async getWithRedemptions(id: string): Promise<ApiResponse<RewardWithRedemptions>> {
    // Backend may include redemption info in reward response
    const rewardResponse = await this.getById(id);
    if (!rewardResponse.success || !rewardResponse.data) {
      return {
        data: null,
        error: rewardResponse.error || 'Reward not found',
        success: false,
      };
    }

    // For now, return reward without redemptions (backend may provide this)
    const reward = rewardResponse.data;
    const rewardWithRedemptions: RewardWithRedemptions = {
      ...reward,
      redemptions: [],
      lastRedeemedAt: null,
      canRedeem: reward.status === 'Active',
      cooldownMessage: null,
    };

    return { data: rewardWithRedemptions, error: null, success: true };
  },

  async getAllWithRedemptions(): Promise<ApiResponse<RewardWithRedemptions[]>> {
    const response = await this.getAll();
    if (!response.success || !response.data) {
      return response as ApiResponse<RewardWithRedemptions[]>;
    }

    const rewardsWithRedemptions: RewardWithRedemptions[] = response.data.map((reward) => ({
      ...reward,
      redemptions: [],
      lastRedeemedAt: null,
      canRedeem: reward.status === 'Active',
      cooldownMessage: null,
    }));

    return { data: rewardsWithRedemptions, error: null, success: true };
  },

  async getByCategory(category: RewardCategory): Promise<ApiResponse<RewardWithRedemptions[]>> {
    const response = await this.getAllWithRedemptions();
    if (!response.success || !response.data) {
      return response;
    }

    const filtered = response.data.filter((r) => r.category === category);
    return { data: filtered, error: null, success: true };
  },

  async create(input: CreateRewardInput): Promise<ApiResponse<Reward>> {
    const response = await apiClient.post<Reward>('/rewards', input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to create reward',
      success: false,
    };
  },

  async update(id: string, input: UpdateRewardInput): Promise<ApiResponse<Reward>> {
    const response = await apiClient.patch<Reward>(`/rewards/${id}`, input);
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to update reward',
      success: false,
    };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/rewards/${id}`);
    return {
      data: undefined,
      error: response.error?.message || null,
      success: response.success,
    };
  },

  async redeem(input: RedeemRewardInput): Promise<ApiResponse<RewardRedemption>> {
    const response = await apiClient.post<RewardRedemption>(`/rewards/${input.rewardId}/redeem`, {
      notes: input.notes,
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to redeem reward',
      success: false,
    };
  },

  async getRedemptionHistory(): Promise<ApiResponse<RewardRedemption[]>> {
    // Backend may provide this via wallet transactions
    const walletResponse = await apiClient.get<{ recentTransactions: RewardRedemption[] }>(
      '/wallet'
    );
    if (walletResponse.success && walletResponse.data) {
      return {
        data: walletResponse.data.recentTransactions.filter((t) => t.type === 'spend'),
        error: null,
        success: true,
      };
    }
    return {
      data: null,
      error: walletResponse.error?.message || 'Failed to fetch redemption history',
      success: false,
    };
  },
};
