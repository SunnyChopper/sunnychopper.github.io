/**
 * Centralized query key factories for React Query
 * Provides type-safe, hierarchical query keys for better cache invalidation
 */

export const queryKeys = {
  // Growth System (module-level data)
  growthSystem: {
    all: ['growth-system'] as const,
    data: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.growthSystem.all, 'data', options] as const)
        : ([...queryKeys.growthSystem.all, 'data'] as const),
    tasks: {
      all: () => [...queryKeys.growthSystem.all, 'tasks'] as const,
      lists: () => [...queryKeys.growthSystem.tasks.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.tasks.lists(), filters]
          : queryKeys.growthSystem.tasks.lists(),
      details: () => [...queryKeys.growthSystem.tasks.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.tasks.details(), id] as const,
    },
    habits: {
      all: () => [...queryKeys.growthSystem.all, 'habits'] as const,
      lists: () => [...queryKeys.growthSystem.habits.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.habits.lists(), filters]
          : queryKeys.growthSystem.habits.lists(),
      details: () => [...queryKeys.growthSystem.habits.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.habits.details(), id] as const,
    },
    metrics: {
      all: () => [...queryKeys.growthSystem.all, 'metrics'] as const,
      lists: () => [...queryKeys.growthSystem.metrics.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.metrics.lists(), filters]
          : queryKeys.growthSystem.metrics.lists(),
      details: () => [...queryKeys.growthSystem.metrics.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.metrics.details(), id] as const,
    },
    goals: {
      all: () => [...queryKeys.growthSystem.all, 'goals'] as const,
      lists: () => [...queryKeys.growthSystem.goals.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.goals.lists(), filters]
          : queryKeys.growthSystem.goals.lists(),
      details: () => [...queryKeys.growthSystem.goals.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.goals.details(), id] as const,
    },
    projects: {
      all: () => [...queryKeys.growthSystem.all, 'projects'] as const,
      lists: () => [...queryKeys.growthSystem.projects.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.projects.lists(), filters]
          : queryKeys.growthSystem.projects.lists(),
      details: () => [...queryKeys.growthSystem.projects.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.projects.details(), id] as const,
      health: () => [...queryKeys.growthSystem.projects.all(), 'health'] as const,
      healthList: (ids: string[]) => [...queryKeys.growthSystem.projects.health(), ids] as const,
    },
    logbook: {
      all: () => [...queryKeys.growthSystem.all, 'logbook'] as const,
      lists: () => [...queryKeys.growthSystem.logbook.all(), 'list'] as const,
      list: (filters?: Record<string, unknown>) =>
        filters
          ? [...queryKeys.growthSystem.logbook.lists(), filters]
          : queryKeys.growthSystem.logbook.lists(),
      details: () => [...queryKeys.growthSystem.logbook.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.growthSystem.logbook.details(), id] as const,
    },
  },

  // Markdown Files
  markdownFiles: {
    all: ['markdown-files'] as const,
    lists: () => [...queryKeys.markdownFiles.all, 'list'] as const,
    list: (folder?: string) =>
      folder ? [...queryKeys.markdownFiles.lists(), folder] : queryKeys.markdownFiles.lists(),
    details: () => [...queryKeys.markdownFiles.all, 'detail'] as const,
    detail: (filePath: string) => [...queryKeys.markdownFiles.details(), filePath] as const,
    tree: () => ['markdown-file-tree'] as const,
  },

  // Chatbot
  chatbot: {
    all: ['chatbot'] as const,
    threads: {
      all: () => [...queryKeys.chatbot.all, 'threads'] as const,
      lists: () => [...queryKeys.chatbot.threads.all(), 'list'] as const,
      details: () => [...queryKeys.chatbot.threads.all(), 'detail'] as const,
      detail: (id: string) => [...queryKeys.chatbot.threads.details(), id] as const,
    },
    messages: {
      all: () => [...queryKeys.chatbot.all, 'messages'] as const,
      lists: () => [...queryKeys.chatbot.messages.all(), 'list'] as const,
      list: (threadId: string) => [...queryKeys.chatbot.messages.lists(), threadId] as const,
    },
  },

  // Draft Notes
  draftNotes: {
    all: ['draft-notes'] as const,
    detail: () => [...queryKeys.draftNotes.all, 'detail'] as const,
  },

  // Mode Preference
  modePreference: {
    all: ['mode-preference'] as const,
    detail: () => [...queryKeys.modePreference.all, 'detail'] as const,
  },

  // Feature Configs
  featureConfigs: {
    all: ['feature-configs'] as const,
    detail: () => [...queryKeys.featureConfigs.all, 'detail'] as const,
  },

  // Backend Health
  backendHealth: {
    all: ['backend-health'] as const,
    detail: () => [...queryKeys.backendHealth.all, 'detail'] as const,
    markdown: () => ['markdown-backend-health'] as const,
  },

  // Wallet
  wallet: {
    all: ['wallet'] as const,
    balance: () => [...queryKeys.wallet.all, 'balance'] as const,
    transactions: (limit?: number) =>
      limit
        ? ([...queryKeys.wallet.all, 'transactions', limit] as const)
        : ([...queryKeys.wallet.all, 'transactions'] as const),
  },

  // Rewards
  rewards: {
    all: ['rewards'] as const,
    lists: () => [...queryKeys.rewards.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.rewards.lists(), filters] : queryKeys.rewards.lists(),
    details: () => [...queryKeys.rewards.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rewards.details(), id] as const,
    withRedemptions: () => [...queryKeys.rewards.all, 'with-redemptions'] as const,
  },
};
