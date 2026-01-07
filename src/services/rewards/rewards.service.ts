import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  Reward,
  RewardRedemption,
  CreateRewardInput,
  UpdateRewardInput,
  RedeemRewardInput,
  RewardWithRedemptions,
  RewardCategory,
} from '../../types/rewards';
import type { ApiResponse } from '../../types/growth-system';

const USER_ID = 'user-1';

function canRedeemReward(
  reward: Reward,
  redemptions: RewardRedemption[]
): { canRedeem: boolean; cooldownMessage: string | null } {
  if (reward.status !== 'Active') {
    return { canRedeem: false, cooldownMessage: 'Reward is not active' };
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const todayRedemptions = redemptions.filter(
    (r) => new Date(r.redeemedAt) >= todayStart
  );

  if (
    reward.maxRedemptionsPerDay &&
    todayRedemptions.length >= reward.maxRedemptionsPerDay
  ) {
    return {
      canRedeem: false,
      cooldownMessage: 'Daily redemption limit reached',
    };
  }

  if (reward.cooldownHours && redemptions.length > 0) {
    const lastRedemption = redemptions.sort(
      (a, b) =>
        new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
    )[0];
    const cooldownEnd = new Date(
      new Date(lastRedemption.redeemedAt).getTime() +
        reward.cooldownHours * 60 * 60 * 1000
    );

    if (now < cooldownEnd) {
      const hoursLeft = Math.ceil(
        (cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
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
    await randomDelay();
    const storage = getStorageAdapter();
    const rewards = await storage.getAll<Reward>('rewards');
    return { data: rewards, error: null, success: true };
  },

  async getById(id: string): Promise<ApiResponse<Reward>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const reward = await storage.getById<Reward>('rewards', id);
    if (!reward) {
      return { data: null, error: 'Reward not found', success: false };
    }
    return { data: reward, error: null, success: true };
  },

  async getWithRedemptions(id: string): Promise<ApiResponse<RewardWithRedemptions>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const reward = await storage.getById<Reward>('rewards', id);
    if (!reward) {
      return { data: null, error: 'Reward not found', success: false };
    }

    const allRedemptions = await storage.getAll<RewardRedemption>('reward_redemptions');
    const redemptions = allRedemptions.filter((r) => r.rewardId === id);

    const lastRedemption = redemptions.sort(
      (a, b) =>
        new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
    )[0];

    const { canRedeem, cooldownMessage } = canRedeemReward(reward, redemptions);

    const rewardWithRedemptions: RewardWithRedemptions = {
      ...reward,
      redemptions,
      lastRedeemedAt: lastRedemption?.redeemedAt || null,
      canRedeem,
      cooldownMessage,
    };

    return { data: rewardWithRedemptions, error: null, success: true };
  },

  async getAllWithRedemptions(): Promise<ApiResponse<RewardWithRedemptions[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const rewards = await storage.getAll<Reward>('rewards');
    const allRedemptions = await storage.getAll<RewardRedemption>('reward_redemptions');

    const rewardsWithRedemptions: RewardWithRedemptions[] = rewards.map((reward) => {
      const redemptions = allRedemptions.filter((r) => r.rewardId === reward.id);
      const lastRedemption = redemptions.sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      )[0];

      const { canRedeem, cooldownMessage } = canRedeemReward(reward, redemptions);

      return {
        ...reward,
        redemptions,
        lastRedeemedAt: lastRedemption?.redeemedAt || null,
        canRedeem,
        cooldownMessage,
      };
    });

    return { data: rewardsWithRedemptions, error: null, success: true };
  },

  async getByCategory(category: RewardCategory): Promise<ApiResponse<RewardWithRedemptions[]>> {
    await randomDelay();
    const response = await this.getAllWithRedemptions();
    if (!response.success || !response.data) {
      return response;
    }

    const filtered = response.data.filter((r) => r.category === category);
    return { data: filtered, error: null, success: true };
  },

  async create(input: CreateRewardInput): Promise<ApiResponse<Reward>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();
    const id = generateId();

    const reward: Reward = {
      id,
      title: input.title,
      description: input.description || null,
      category: input.category,
      pointCost: input.pointCost,
      icon: input.icon || null,
      imageUrl: input.imageUrl || null,
      isAutomated: input.isAutomated || false,
      automationInstructions: input.automationInstructions || null,
      cooldownHours: input.cooldownHours || null,
      maxRedemptionsPerDay: input.maxRedemptionsPerDay || null,
      status: input.status || 'Active',
      userId: USER_ID,
      createdAt: now,
      updatedAt: now,
    };

    await storage.create('rewards', id, reward);
    return { data: reward, error: null, success: true };
  },

  async update(id: string, input: UpdateRewardInput): Promise<ApiResponse<Reward>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    const updated = await storage.update<Reward>('rewards', id, {
      ...input,
      updatedAt: now,
    });

    if (!updated) {
      return { data: null, error: 'Reward not found', success: false };
    }

    return { data: updated, error: null, success: true };
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const success = await storage.delete('rewards', id);

    if (!success) {
      return { data: null, error: 'Reward not found', success: false };
    }

    return { data: null, error: null, success: true };
  },

  async redeem(input: RedeemRewardInput): Promise<ApiResponse<RewardRedemption>> {
    await randomDelay();
    const storage = getStorageAdapter();

    const rewardResponse = await this.getWithRedemptions(input.rewardId);
    if (!rewardResponse.success || !rewardResponse.data) {
      return { data: null, error: rewardResponse.error, success: false };
    }

    const reward = rewardResponse.data;
    if (!reward.canRedeem) {
      return {
        data: null,
        error: reward.cooldownMessage || 'Cannot redeem this reward',
        success: false,
      };
    }

    const now = new Date().toISOString();
    const redemptionId = generateId();

    const redemption: RewardRedemption = {
      id: redemptionId,
      rewardId: input.rewardId,
      userId: USER_ID,
      pointsSpent: reward.pointCost,
      redeemedAt: now,
      notes: input.notes || null,
    };

    await storage.create('reward_redemptions', redemptionId, redemption);
    return { data: redemption, error: null, success: true };
  },

  async getRedemptionHistory(): Promise<ApiResponse<RewardRedemption[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const redemptions = await storage.getAll<RewardRedemption>('reward_redemptions');
    const sorted = redemptions.sort(
      (a, b) =>
        new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
    );
    return { data: sorted, error: null, success: true };
  },
};
