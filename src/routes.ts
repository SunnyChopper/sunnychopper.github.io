export const ADMIN_BASE = '/admin' as const;

export const ROUTES = {
  home: '/' as const,
  products: '/products' as const,

  admin: {
    base: ADMIN_BASE,
    login: `${ADMIN_BASE}/login` as const,
    dashboard: `${ADMIN_BASE}/dashboard` as const,
    growthSystem: `${ADMIN_BASE}/growth-system` as const,
    tasks: `${ADMIN_BASE}/tasks` as const,
    habits: `${ADMIN_BASE}/habits` as const,
    metrics: `${ADMIN_BASE}/metrics` as const,
    goals: `${ADMIN_BASE}/goals` as const,
    projects: `${ADMIN_BASE}/projects` as const,
    logbook: `${ADMIN_BASE}/logbook` as const,
    weeklyReview: `${ADMIN_BASE}/weekly-review` as const,
    assistant: `${ADMIN_BASE}/assistant` as const,
    settings: `${ADMIN_BASE}/settings` as const,
    componentsDemo: `${ADMIN_BASE}/components-demo` as const,
  },
} as const;

export const ADMIN_CHILD_ROUTES = {
  dashboard: 'dashboard' as const,
  growthSystem: 'growth-system' as const,
  tasks: 'tasks' as const,
  habits: 'habits' as const,
  metrics: 'metrics' as const,
  goals: 'goals' as const,
  projects: 'projects' as const,
  logbook: 'logbook' as const,
  weeklyReview: 'weekly-review' as const,
  assistant: 'assistant' as const,
  settings: 'settings' as const,
  componentsDemo: 'components-demo' as const,
} as const;


