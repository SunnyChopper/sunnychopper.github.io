import { getStorageAdapter } from '../../lib/storage';
import { generateId, randomDelay } from '../../mocks/storage';
import type {
  WalletBalance,
  WalletTransaction,
} from '../../types/rewards';
import type { ApiResponse } from '../../types/growth-system';

const USER_ID = 'user-1';

async function ensureWalletExists(storage: ReturnType<typeof getStorageAdapter>): Promise<WalletBalance> {
  const existing = await storage.getById<WalletBalance>('wallet_balance', USER_ID);

  if (existing) {
    return existing;
  }

  const newWallet: WalletBalance = {
    userId: USER_ID,
    totalPoints: 0,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    updatedAt: new Date().toISOString(),
  };

  await storage.create('wallet_balance', USER_ID, newWallet);
  return newWallet;
}

export const walletService = {
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const balance = await ensureWalletExists(storage);
    return { data: balance, error: null, success: true };
  },

  async getTransactions(limit?: number): Promise<ApiResponse<WalletTransaction[]>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const transactions = await storage.getAll<WalletTransaction>('wallet_transactions');

    const sorted = transactions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const result = limit ? sorted.slice(0, limit) : sorted;
    return { data: result, error: null, success: true };
  },

  async addPoints(
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    const currentBalance = await ensureWalletExists(storage);

    const newBalance: WalletBalance = {
      ...currentBalance,
      totalPoints: currentBalance.totalPoints + amount,
      lifetimeEarned: currentBalance.lifetimeEarned + amount,
      updatedAt: now,
    };

    await storage.update('wallet_balance', USER_ID, newBalance);

    const transactionId = generateId();
    const transaction: WalletTransaction = {
      id: transactionId,
      userId: USER_ID,
      amount,
      type: 'earn',
      source,
      sourceEntityType: sourceEntityType || null,
      sourceEntityId: sourceEntityId || null,
      description,
      createdAt: now,
    };

    await storage.create('wallet_transactions', transactionId, transaction);

    return {
      data: { balance: newBalance, transaction },
      error: null,
      success: true,
    };
  },

  async spendPoints(
    amount: number,
    source: WalletTransaction['source'],
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    const currentBalance = await ensureWalletExists(storage);

    if (currentBalance.totalPoints < amount) {
      return {
        data: null,
        error: 'Insufficient points',
        success: false,
      };
    }

    const newBalance: WalletBalance = {
      ...currentBalance,
      totalPoints: currentBalance.totalPoints - amount,
      lifetimeSpent: currentBalance.lifetimeSpent + amount,
      updatedAt: now,
    };

    await storage.update('wallet_balance', USER_ID, newBalance);

    const transactionId = generateId();
    const transaction: WalletTransaction = {
      id: transactionId,
      userId: USER_ID,
      amount: -amount,
      type: 'spend',
      source,
      sourceEntityType: sourceEntityType || null,
      sourceEntityId: sourceEntityId || null,
      description,
      createdAt: now,
    };

    await storage.create('wallet_transactions', transactionId, transaction);

    return {
      data: { balance: newBalance, transaction },
      error: null,
      success: true,
    };
  },

  async refundPoints(
    amount: number,
    description: string,
    sourceEntityType?: 'task' | 'reward' | null,
    sourceEntityId?: string | null
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    const currentBalance = await ensureWalletExists(storage);

    const newBalance: WalletBalance = {
      ...currentBalance,
      totalPoints: currentBalance.totalPoints + amount,
      updatedAt: now,
    };

    await storage.update('wallet_balance', USER_ID, newBalance);

    const transactionId = generateId();
    const transaction: WalletTransaction = {
      id: transactionId,
      userId: USER_ID,
      amount,
      type: 'refund',
      source: 'system',
      sourceEntityType: sourceEntityType || null,
      sourceEntityId: sourceEntityId || null,
      description,
      createdAt: now,
    };

    await storage.create('wallet_transactions', transactionId, transaction);

    return {
      data: { balance: newBalance, transaction },
      error: null,
      success: true,
    };
  },

  async adjustPoints(
    amount: number,
    description: string
  ): Promise<ApiResponse<{ balance: WalletBalance; transaction: WalletTransaction }>> {
    await randomDelay();
    const storage = getStorageAdapter();
    const now = new Date().toISOString();

    const currentBalance = await ensureWalletExists(storage);

    const newBalance: WalletBalance = {
      ...currentBalance,
      totalPoints: currentBalance.totalPoints + amount,
      updatedAt: now,
    };

    await storage.update('wallet_balance', USER_ID, newBalance);

    const transactionId = generateId();
    const transaction: WalletTransaction = {
      id: transactionId,
      userId: USER_ID,
      amount,
      type: 'adjustment',
      source: 'manual',
      sourceEntityType: null,
      sourceEntityId: null,
      description,
      createdAt: now,
    };

    await storage.create('wallet_transactions', transactionId, transaction);

    return {
      data: { balance: newBalance, transaction },
      error: null,
      success: true,
    };
  },
};
