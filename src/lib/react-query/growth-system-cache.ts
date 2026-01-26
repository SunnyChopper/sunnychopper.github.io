import type { QueryClient, QueryKey } from '@tanstack/react-query';
import type { ApiResponse, DashboardSummaryResponse } from '@/types/api-contracts';
import type { Goal, Habit, LogbookEntry, Metric, Project, Task } from '@/types/growth-system';
import type {
  Reward,
  RewardRedemption,
  RewardWithRedemptions,
  WalletBalance,
  WalletTransaction,
} from '@/types/rewards';
import { queryKeys } from '@/lib/react-query/query-keys';
import { _canRedeemReward } from '@/services/rewards/rewards.service';

type ListCache<T> = { data?: T[] } | T[];

const extractListData = <T>(value: ListCache<T> | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
};

const mergeListData = <T>(value: ListCache<T> | undefined, data: T[]): ListCache<T> => {
  if (Array.isArray(value)) return data;
  if (value && typeof value === 'object') {
    return { ...value, data };
  }
  return { data };
};

const updateListQueries = <T>(
  queryClient: QueryClient,
  queryKeyBase: QueryKey,
  updater: (items: T[]) => T[]
): void => {
  const queries = queryClient.getQueriesData<ListCache<T>>({ queryKey: queryKeyBase });
  queries.forEach(([key, data]) => {
    const next = updater(extractListData<T>(data));
    queryClient.setQueryData(key, mergeListData<T>(data, next));
  });
};

const upsertById = <T extends { id: string }>(items: T[], item: T): T[] => {
  const index = items.findIndex((existing) => existing.id === item.id);
  if (index === -1) {
    return [...items, item];
  }
  const next = [...items];
  next[index] = item;
  return next;
};

const removeById = <T extends { id: string }>(items: T[], id: string): T[] =>
  items.filter((item) => item.id !== id);

const updateDashboardQueries = (
  queryClient: QueryClient,
  updater: (data: DashboardSummaryResponse) => DashboardSummaryResponse
): void => {
  const queries = queryClient.getQueriesData<ApiResponse<DashboardSummaryResponse>>({
    queryKey: queryKeys.growthSystem.data(),
  });
  queries.forEach(([key, response]) => {
    if (!response?.data) return;
    queryClient.setQueryData<ApiResponse<DashboardSummaryResponse>>(key, {
      ...response,
      data: updater(response.data),
    });
  });
};

const updateDetailCache = <T extends { id: string }>(
  queryClient: QueryClient,
  detailKey: (id: string) => readonly unknown[],
  item: T
): void => {
  queryClient.setQueryData(detailKey(item.id), { success: true, data: item });
};

export const upsertTaskCache = (queryClient: QueryClient, task: Task): void => {
  updateListQueries<Task>(queryClient, queryKeys.growthSystem.tasks.lists(), (items) =>
    upsertById(items, task)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    tasks: upsertById(data.tasks, task),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.tasks.detail, task);
};

export const removeTaskCache = (queryClient: QueryClient, taskId: string): void => {
  updateListQueries<Task>(queryClient, queryKeys.growthSystem.tasks.lists(), (items) =>
    removeById(items, taskId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    tasks: removeById(data.tasks, taskId),
  }));
};

export const upsertGoalCache = (queryClient: QueryClient, goal: Goal): void => {
  updateListQueries<Goal>(queryClient, queryKeys.growthSystem.goals.lists(), (items) =>
    upsertById(items, goal)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    goals: upsertById(data.goals, goal),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.goals.detail, goal);
};

export const removeGoalCache = (queryClient: QueryClient, goalId: string): void => {
  updateListQueries<Goal>(queryClient, queryKeys.growthSystem.goals.lists(), (items) =>
    removeById(items, goalId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    goals: removeById(data.goals, goalId),
  }));
};

export const upsertProjectCache = (queryClient: QueryClient, project: Project): void => {
  updateListQueries<Project>(queryClient, queryKeys.growthSystem.projects.lists(), (items) =>
    upsertById(items, project)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    projects: upsertById(data.projects, project),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.projects.detail, project);
};

export const removeProjectCache = (queryClient: QueryClient, projectId: string): void => {
  updateListQueries<Project>(queryClient, queryKeys.growthSystem.projects.lists(), (items) =>
    removeById(items, projectId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    projects: removeById(data.projects, projectId),
  }));
};

export const upsertHabitCache = (queryClient: QueryClient, habit: Habit): void => {
  updateListQueries<Habit>(queryClient, queryKeys.growthSystem.habits.lists(), (items) =>
    upsertById(items, habit)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    habits: upsertById(data.habits, habit),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.habits.detail, habit);
};

export const removeHabitCache = (queryClient: QueryClient, habitId: string): void => {
  updateListQueries<Habit>(queryClient, queryKeys.growthSystem.habits.lists(), (items) =>
    removeById(items, habitId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    habits: removeById(data.habits, habitId),
  }));
};

export const upsertMetricCache = (queryClient: QueryClient, metric: Metric): void => {
  updateListQueries<Metric>(queryClient, queryKeys.growthSystem.metrics.lists(), (items) =>
    upsertById(items, metric)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    metrics: upsertById(data.metrics, metric),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.metrics.detail, metric);
};

export const removeMetricCache = (queryClient: QueryClient, metricId: string): void => {
  updateListQueries<Metric>(queryClient, queryKeys.growthSystem.metrics.lists(), (items) =>
    removeById(items, metricId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    metrics: removeById(data.metrics, metricId),
  }));
};

export const upsertLogbookEntryCache = (queryClient: QueryClient, entry: LogbookEntry): void => {
  updateListQueries<LogbookEntry>(queryClient, queryKeys.growthSystem.logbook.lists(), (items) =>
    upsertById(items, entry)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    logbookEntries: upsertById(data.logbookEntries, entry),
  }));
  updateDetailCache(queryClient, queryKeys.growthSystem.logbook.detail, entry);
};

export const removeLogbookEntryCache = (queryClient: QueryClient, entryId: string): void => {
  updateListQueries<LogbookEntry>(queryClient, queryKeys.growthSystem.logbook.lists(), (items) =>
    removeById(items, entryId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    logbookEntries: removeById(data.logbookEntries, entryId),
  }));
};

const buildRewardWithRedemptions = (
  reward: RewardWithRedemptions | Reward,
  base?: RewardWithRedemptions
): RewardWithRedemptions => {
  const redemptions = base?.redemptions ?? (reward as RewardWithRedemptions).redemptions ?? [];
  const status = (reward as RewardWithRedemptions).status ?? base?.status;
  return {
    ...(base || {}),
    ...(reward as RewardWithRedemptions),
    redemptions,
    lastRedeemedAt:
      base?.lastRedeemedAt ?? (reward as RewardWithRedemptions).lastRedeemedAt ?? null,
    canRedeem:
      (reward as RewardWithRedemptions).canRedeem ??
      base?.canRedeem ??
      (status ? status === 'Active' : true),
    cooldownMessage:
      (reward as RewardWithRedemptions).cooldownMessage ?? base?.cooldownMessage ?? null,
  };
};

const findRewardInCache = (
  queryClient: QueryClient,
  rewardId: string
): RewardWithRedemptions | undefined => {
  const queries = queryClient.getQueriesData<ListCache<RewardWithRedemptions>>({
    queryKey: queryKeys.rewards.withRedemptions(),
  });
  for (const [, data] of queries) {
    const match = extractListData(data).find((reward) => reward.id === rewardId);
    if (match) return match;
  }
  return undefined;
};

export const upsertRewardCache = (
  queryClient: QueryClient,
  reward: RewardWithRedemptions
): void => {
  updateListQueries<RewardWithRedemptions>(
    queryClient,
    queryKeys.rewards.withRedemptions(),
    (items) => upsertById(items, reward)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    rewards: upsertById(data.rewards, reward),
  }));
  queryClient.setQueryData(queryKeys.rewards.detail(reward.id), {
    success: true,
    data: reward,
  });
};

export const removeRewardCache = (queryClient: QueryClient, rewardId: string): void => {
  updateListQueries<RewardWithRedemptions>(
    queryClient,
    queryKeys.rewards.withRedemptions(),
    (items) => removeById(items, rewardId)
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    rewards: removeById(data.rewards, rewardId),
  }));
};

export const coerceRewardWithRedemptionsFromCache = (
  queryClient: QueryClient,
  reward: Reward
): RewardWithRedemptions => {
  const existing = findRewardInCache(queryClient, reward.id);
  return buildRewardWithRedemptions(reward, existing);
};

export const applyRewardRedemption = (
  queryClient: QueryClient,
  redemption: RewardRedemption
): void => {
  const applyRedemption = (items: RewardWithRedemptions[]): RewardWithRedemptions[] =>
    items.map((reward) => {
      if (reward.id !== redemption.rewardId) return reward;
      const nextRedemptions = [...reward.redemptions, redemption];
      const { canRedeem, cooldownMessage } = _canRedeemReward(reward, nextRedemptions);
      return {
        ...reward,
        redemptions: nextRedemptions,
        lastRedeemedAt: redemption.redeemedAt,
        canRedeem,
        cooldownMessage,
      };
    });

  updateListQueries<RewardWithRedemptions>(
    queryClient,
    queryKeys.rewards.withRedemptions(),
    applyRedemption
  );
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    rewards: applyRedemption(data.rewards),
  }));
};

export const applyWalletUpdate = (
  queryClient: QueryClient,
  payload: { balance: WalletBalance; transaction: WalletTransaction }
): void => {
  queryClient.setQueryData(queryKeys.wallet.balance(), { success: true, data: payload.balance });
  updateListQueries<WalletTransaction>(queryClient, queryKeys.wallet.transactions(), (items) => [
    payload.transaction,
    ...items,
  ]);
  updateDashboardQueries(queryClient, (data) => ({
    ...data,
    wallet: {
      ...data.wallet,
      balance: payload.balance,
      recentTransactions: [payload.transaction, ...data.wallet.recentTransactions],
    },
  }));
};

export const applyWalletRedemption = (
  queryClient: QueryClient,
  redemption: RewardRedemption
): void => {
  const balanceQuery = queryClient.getQueryData<ApiResponse<WalletBalance>>(
    queryKeys.wallet.balance()
  );
  if (balanceQuery?.data) {
    const nextBalance: WalletBalance = {
      ...balanceQuery.data,
      totalPoints: balanceQuery.data.totalPoints - redemption.pointsSpent,
      lifetimeSpent: balanceQuery.data.lifetimeSpent + redemption.pointsSpent,
      updatedAt: redemption.redeemedAt,
    };
    queryClient.setQueryData(queryKeys.wallet.balance(), { success: true, data: nextBalance });
    updateDashboardQueries(queryClient, (data) => ({
      ...data,
      wallet: {
        ...data.wallet,
        balance: nextBalance,
      },
    }));
  }
};

export const coerceRewardWithRedemptions = (reward: RewardWithRedemptions): RewardWithRedemptions =>
  buildRewardWithRedemptions(reward);
