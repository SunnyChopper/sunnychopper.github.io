import { apiClient } from '../../lib/api-client';
import type { WalletBalance, WalletTransaction } from '../../types/rewards';
import type { ApiResponse } from '../../types/api-contracts';

interface WalletResponse {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  recentTransactions: WalletTransaction[];
}

export const walletService = {
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    const response = await apiClient.get<WalletResponse>('/wallet');
    if (response.success && response.data) {
      const balance: WalletBalance = {
        userId: '', // Will be set by backend
        totalPoints: response.data.balance,
        lifetimeEarned: response.data.lifetimeEarned,
        lifetimeSpent: response.data.lifetimeSpent,
        updatedAt: new Date().toISOString(),
      };
      return { data: balance, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to fetch wallet balance',
      success: false,
    };
  },

  async getTransactions(limit?: number): Promise<ApiResponse<WalletTransaction[]>> {
    const response = await apiClient.get<WalletResponse>('/wallet');
    if (response.success && response.data) {
      const transactions = limit
        ? response.data.recentTransactions.slice(0, limit)
        : response.data.recentTransactions;
      return { data: transactions, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to fetch transactions',
      success: false,
    };
  },

  async addPoints(
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    const response = await apiClient.post<{
      balance: WalletBalance;
      transaction: WalletTransaction;
    }>('/wallet/add', {
      amount,
      source,
      description,
      sourceEntityType,
      sourceEntityId,
    });
    if (response.success && response.data) {
      return { data: response.data, error: null, success: true };
    }
    return {
      data: null,
      error: response.error?.message || 'Failed to add points',
      success: false,
    };
  },

  async spendPoints(
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    // Spending is handled via reward redemption endpoint
    // This method may need to call a different endpoint or be handled differently
    const balanceResponse = await this.getBalance();
    if (!balanceResponse.success || !balanceResponse.data) {
      return {
        data: null,
        error: 'Failed to get current balance',
        success: false,
      };
    }

    if (balanceResponse.data.totalPoints < amount) {
      return {
        data: null,
        error: 'Insufficient points',
        success: false,
      };
    }

    // Backend handles point deduction via redemption endpoint
    // This is a fallback - actual spending should go through reward redemption
    return {
      data: null,
      error: 'Use reward redemption endpoint to spend points',
      success: false,
    };
  },

  async refundPoints(
    amount: number,
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    // Refund via addPoints with source='refund'
    return this.addPoints(amount, 'refund', description, sourceEntityType, sourceEntityId);
  },

  async adjustPoints(
    amount: number,
    description: string
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    // Manual adjustment via addPoints
    return this.addPoints(amount, 'manual', description);
  },
};
