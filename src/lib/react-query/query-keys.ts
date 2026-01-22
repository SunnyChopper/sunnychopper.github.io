/**
 * Centralized query key factories for React Query
 * Provides type-safe, hierarchical query keys for better cache invalidation
 */

export const queryKeys = {
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.tasks.lists(), filters] : queryKeys.tasks.lists(),
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },

  // Habits
  habits: {
    all: ['habits'] as const,
    lists: () => [...queryKeys.habits.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.habits.lists(), filters] : queryKeys.habits.lists(),
    details: () => [...queryKeys.habits.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.habits.details(), id] as const,
  },

  // Metrics
  metrics: {
    all: ['metrics'] as const,
    lists: () => [...queryKeys.metrics.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.metrics.lists(), filters] : queryKeys.metrics.lists(),
    details: () => [...queryKeys.metrics.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.metrics.details(), id] as const,
  },

  // Goals
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.goals.lists(), filters] : queryKeys.goals.lists(),
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.projects.lists(), filters] : queryKeys.projects.lists(),
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },

  // Logbook
  logbook: {
    all: ['logbook'] as const,
    lists: () => [...queryKeys.logbook.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.logbook.lists(), filters] : queryKeys.logbook.lists(),
    details: () => [...queryKeys.logbook.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.logbook.details(), id] as const,
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

  // API Keys
  apiKeys: {
    all: ['api-keys'] as const,
    detail: () => [...queryKeys.apiKeys.all, 'detail'] as const,
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

  // Dashboard Summary (Growth System)
  dashboard: {
    all: ['dashboard'] as const,
    summary: (options?: Record<string, unknown>) =>
      options
        ? ([...queryKeys.dashboard.all, 'summary', options] as const)
        : ([...queryKeys.dashboard.all, 'summary'] as const),
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
